const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET All Rooms & Beds Status
exports.getRooms = async (req, res) => {
    try {
        const rooms = await prisma.room.findMany({
            include: {
                beds: {
                    include: {
                        current_patient: true, // Show who occupies the bed
                        admissions: {
                            where: { status: 'ACTIVE' },
                            take: 1
                        }
                    },
                    orderBy: { code: 'asc' }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Calculate stats
        const stats = {
            total: 0,
            available: 0,
            occupied: 0,
            cleaning: 0
        };

        rooms.forEach(r => {
            r.beds.forEach(b => {
                stats.total++;
                if (b.status === 'AVAILABLE') stats.available++;
                if (b.status === 'OCCUPIED') stats.occupied++;
                if (b.status === 'CLEANING') stats.cleaning++;
            });
        });

        res.json({
            status: 'success',
            data: rooms,
            stats
        });
    } catch (error) {
        console.error('Get Rooms Error:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

// GET Pending Admissions (Patients referred to Inpatient but not yet admitted)
exports.getPendingAdmissions = async (req, res) => {
    try {
        // Find Medical Records from last 24h with disposition RAWAT_INAP
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const pendingRecords = await prisma.medicalRecord.findMany({
            where: {
                disposition: 'RAWAT_INAP',
                visit_date: { gte: yesterday }
            },
            include: {
                patient: {
                    include: {
                        admissions: {
                            where: { status: 'ACTIVE' }
                        }
                    }
                },
                doctor: true
            },
            orderBy: { visit_date: 'desc' }
        });

        // Filter out patients who are already admitted
        const readyToAdmit = pendingRecords.filter(r => r.patient.admissions.length === 0);

        res.json({
            status: 'success',
            data: readyToAdmit
        });
    } catch (error) {
        console.error('Get Pending Admissions Error:', error);
        res.status(500).json({ error: 'Failed to fetch pending admissions' });
    }
};

// CHECK-IN (Admit Patient)
exports.checkIn = async (req, res) => {
    const { patientId, bedId, diagnosa } = req.body;

    try {
        await prisma.$transaction(async (prisma) => {
            // 1. Verify Bed Availability
            const bed = await prisma.bed.findUnique({ where: { id: parseInt(bedId) } });
            if (bed.status !== 'AVAILABLE') {
                throw new Error('Bed is not available');
            }

            // 2. Update Bed Status
            await prisma.bed.update({
                where: { id: parseInt(bedId) },
                data: {
                    status: 'OCCUPIED',
                    current_patient_id: parseInt(patientId)
                }
            });

            // 3. Create Admission Record
            await prisma.admission.create({
                data: {
                    patient_id: parseInt(patientId),
                    bed_id: parseInt(bedId),
                    status: 'ACTIVE',
                    diagnosa_masuk: diagnosa || 'Observasi'
                }
            });

            // 4. Update Patient Relation (Link to Bed)
            await prisma.patient.update({ // This assumes unique relation or handled by Bed relation
                where: { id: parseInt(patientId) },
                data: {} // No direct bed_id field in Patient, it's back-relation via Bed.current_patient
            });
        });

        // SOCKET EMIT
        req.io.emit('admission_update', { type: 'CHECKIN', patientId, bedId });

        res.json({ status: 'success', message: 'Patient admitted successfully' });
    } catch (error) {
        console.error('Check-in Error:', error);
        res.status(400).json({ error: error.message || 'Check-in failed' });
    }
};

// CHECK-OUT (Discharge Patient)
exports.checkOut = async (req, res) => {
    const { bedId } = req.body;

    try {
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Find the bed
            const bed = await prisma.bed.findUnique({
                where: { id: parseInt(bedId) },
                include: { room: true }
            });
            if (!bed) throw new Error('Bed not found');

            const patientId = bed.current_patient_id;

            // 2. Find Active Admission
            const admission = await prisma.admission.findFirst({
                where: {
                    bed_id: parseInt(bedId),
                    status: 'ACTIVE'
                }
            });

            if (!admission) throw new Error('No active admission found for this bed');

            // --- SMART BILLING: GENERATE INVOICE ---
            const checkInDate = new Date(admission.check_in);
            const now = new Date();
            const diffTime = Math.abs(now - checkInDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
            const roomPrice = parseFloat(bed.room.price);
            const roomTotal = roomPrice * diffDays;

            // Fetch Service Orders during stay
            const serviceOrders = await prisma.serviceOrder.findMany({
                where: {
                    medical_record: { patient_id: patientId },
                    created_at: { gte: checkInDate }
                },
                include: { tariff: true }
            });

            // Calculate Total
            const serviceTotal = serviceOrders.reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);
            const grandTotal = roomTotal + serviceTotal;

            // Create Invoice & Transaction
            const invoiceNo = `INV/${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

            const items = [
                { description: `Kamar (${bed.room.type}) - ${diffDays} Hari`, amount: roomPrice, quantity: diffDays },
                ...serviceOrders.map(so => ({
                    description: `Jasa: ${so.tariff ? so.tariff.name : so.type}`,
                    amount: parseFloat(so.price) || 0,
                    quantity: 1
                }))
            ];

            // Create Transaction Record (Financial)
            const transaction = await prisma.transaction.create({
                data: {
                    invoice_no: invoiceNo,
                    patient_id: patientId,
                    total_amount: grandTotal,
                    status: 'UNPAID', // Receptionist will collect payment
                    medical_record_id: serviceOrders[0]?.medical_record_id || undefined, // Optional link
                    items: {
                        create: items
                    }
                }
            });

            // Update Admission
            await prisma.admission.update({
                where: { id: admission.id },
                data: {
                    status: 'DISCHARGED',
                    check_out: now
                }
            });

            // 3. Update Bed to CLEANING
            await prisma.bed.update({
                where: { id: parseInt(bedId) },
                data: {
                    status: 'CLEANING',
                    current_patient_id: null
                }
            });

            return { transaction, diffDays, grandTotal };
        });

        // SOCKET EMIT
        req.io.emit('admission_update', { type: 'CHECKOUT', bedId });

        res.json({
            status: 'success',
            message: `Patient discharged. Invoice generated: Rp ${result.grandTotal.toLocaleString('id-ID')}`,
            invoice: result.transaction
        });
    } catch (error) {
        console.error('Check-out Error:', error);
        res.status(400).json({ error: error.message });
    }
};

// UPDATE Bed Status (e.g. Cleaning -> Available)
exports.updateBedStatus = async (req, res) => {
    const { bedId, status } = req.body; // status: AVAILABLE, MTC, etc.

    try {
        await prisma.bed.update({
            where: { id: parseInt(bedId) },
            data: { status }
        });

        // SOCKET EMIT
        req.io.emit('admission_update', { type: 'BED_STATUS', bedId, status });

        res.json({ status: 'success', message: `Bed status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update bed status' });
    }
};

// BED HEAD UNIT (Tablet) Logic

// GET Bed Panel Info (Public/Kiosk Access or Auth)
exports.getBedPanel = async (req, res) => {
    const { bedId } = req.params;
    try {
        const bed = await prisma.bed.findUnique({
            where: { id: parseInt(bedId) },
            include: {
                room: true,
                current_patient: {
                    select: { id: true, name: true, birth_date: true, gender: true, no_rm: true }
                },
                admissions: {
                    where: { status: 'ACTIVE' },
                    take: 1
                }
            }
        });

        if (!bed) return res.status(404).json({ error: 'Bed not found' });

        // Real-time Billing Calculation (Smart Billing)
        let billing_estimate = 0;
        let lengthOfStay = 0;

        if (bed.admissions && bed.admissions.length > 0) {
            const admission = bed.admissions[0];
            const checkInDate = new Date(admission.check_in);
            const now = new Date();

            // Calculate days (rounding up to 1 day minimum)
            const diffTime = Math.abs(now - checkInDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            lengthOfStay = diffDays > 0 ? diffDays : 1;

            if (bed.room && bed.room.price) {
                billing_estimate = lengthOfStay * parseFloat(bed.room.price);
            }
        }

        // Mock Doctor & Diet (To be integrated later with ServiceOrder & DietOrder)
        const mockData = {
            doctor: {
                name: 'Dr. Spesialis Dalam', // Should fetch from Doctor model
                visit_time: '09:00 - 10:00'
            },
            diet: 'Bubur Saring (Low Salt)', // Should fetch from DietOrder
            billing_estimate,
            lengthOfStay
        };

        res.json({
            status: 'success',
            data: {
                ...bed,
                ...mockData
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Request Service (Call Nurse / Cleaning)
exports.requestService = async (req, res) => {
    const { bedId, service } = req.body; // service: 'NURSE', 'CLEANING', NULL (Cancel)
    try {
        await prisma.bed.update({
            where: { id: parseInt(bedId) },
            data: { service_request: service }
        });
        res.json({ status: 'success', message: `Service ${service} requested` });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

// GET Active Inpatients (For Nurse Station)
exports.getActive = async (req, res) => {
    try {
        const admissions = await prisma.admission.findMany({
            where: { status: 'ACTIVE' },
            include: {
                patient: true,
                bed: {
                    include: { room: true }
                }
            },
            orderBy: { check_in: 'desc' }
        });
        res.json(admissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch active inpatients' });
    }
};
