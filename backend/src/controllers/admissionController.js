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
        await prisma.$transaction(async (prisma) => {
            // 1. Find the bed
            const bed = await prisma.bed.findUnique({ where: { id: parseInt(bedId) } });
            if (!bed) throw new Error('Bed not found');

            const patientId = bed.current_patient_id;

            // 2. Find Active Admission
            const admission = await prisma.admission.findFirst({
                where: {
                    bed_id: parseInt(bedId),
                    status: 'ACTIVE'
                }
            });

            if (admission) {
                // Update Admission
                await prisma.admission.update({
                    where: { id: admission.id },
                    data: {
                        status: 'DISCHARGED',
                        check_out: new Date()
                    }
                });
            }

            // 3. Update Bed to CLEANING (Standard Protocol)
            await prisma.bed.update({
                where: { id: parseInt(bedId) },
                data: {
                    status: 'CLEANING',
                    current_patient_id: null
                }
            });
        });

        res.json({ status: 'success', message: 'Patient discharged. Bed is now CLEANING.' });
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

        // Mock Doctor & Bill
        const mockData = {
            doctor: {
                name: 'Dr. Spesialis Dalam',
                visit_time: '09:00 - 10:00'
            },
            billing_estimate: 2500000,
            diet: 'Bubur Saring (Low Salt)'
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
