const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Admissions Ready for Discharge
exports.getDischargeCandidates = async (req, res) => {
    try {
        const admissions = await prisma.admission.findMany({
            where: {
                status: {
                    in: ['ACTIVE', 'DISCHARGE_INITIATED']
                }
            },
            include: {
                patient: true,
                bed: { include: { room: true } },
                doctor: true
            },
            orderBy: { admission_date: 'desc' }
        });
        res.json(admissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Initiate Discharge (Doctor's Order)
exports.initiateDischarge = async (req, res) => {
    try {
        const { id } = req.params;
        const { discharge_notes, icd10_code } = req.body;

        const admission = await prisma.admission.update({
            where: { id: parseInt(id) },
            data: {
                status: 'DISCHARGE_INITIATED',
                diagnosa_keluar: icd10_code, // Assuming existing field or we map it
                notes: discharge_notes
            }
        });

        res.json(admission);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Finalize Discharge (Nurse/Admin)
exports.finalizeDischarge = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // PULANG, RUJUK, MENINGGAL

        // 1. Get Admission Details
        const admission = await prisma.admission.findUnique({
            where: { id: parseInt(id) },
            include: {
                bed: { include: { room: true } },
                patient: true
            }
        });

        if (!admission || admission.status === 'DISCHARGED') {
            return res.status(400).json({ error: 'Invalid Admission or Already Discharged' });
        }

        const checkIn = new Date(admission.check_in);
        const dischargeDate = new Date();

        // Calculate LOS (Days) - Minimum 1 day
        const diffTime = Math.abs(dischargeDate - checkIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        // Calculate Room Charge
        const roomPrice = parseFloat(admission.bed?.room?.price || 0);
        const roomTotal = roomPrice * diffDays;

        // 2. Create Invoice
        // Check if invoice already exists? Assumed new for now.
        const invoice = await prisma.invoice.create({
            data: {
                patient_id: admission.patient_id,
                admission_id: admission.id,
                status: 'PENDING',
                total_amount: roomTotal, // Initial amount, can be updated later
                items: {
                    create: [
                        {
                            description: `Room Charge (${diffDays} days @ ${roomPrice})`,
                            amount: roomTotal,
                            quantity: 1
                        }
                    ]
                }
            }
        });

        // 3. Update Admission
        await prisma.admission.update({
            where: { id: parseInt(id) },
            data: {
                status: 'DISCHARGED',
                check_out: dischargeDate,
            }
        });

        // 4. Update Bed Status -> CLEANING (Dirty)
        if (admission.bed_id) {
            await prisma.bed.update({
                where: { id: admission.bed_id },
                data: {
                    status: 'CLEANING',
                    current_patient_id: null
                }
            });
        }

        res.json({
            message: 'Patient Discharged Successfully',
            invoice_id: invoice.id,
            total_bill: roomTotal,
            los: diffDays
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
