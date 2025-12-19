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

        // 1. Update Admission
        const admission = await prisma.admission.update({
            where: { id: parseInt(id) },
            data: {
                status: 'DISCHARGED',
                discharge_date: new Date(),
            }
        });

        // 2. Update Bed Status -> CLEANING (Dirty)
        if (admission.bed_id) {
            await prisma.bed.update({
                where: { id: admission.bed_id },
                data: {
                    status: 'CLEANING',
                    current_patient_id: null
                }
            });
        }

        res.json({ message: 'Patient Discharged Successfully', admission });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
