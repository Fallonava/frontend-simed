const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/inpatient/:admissionId/clinical
exports.getClinicalData = async (req, res) => {
    const { admissionId } = req.params;
    try {
        const admission = await prisma.admission.findUnique({
            where: { id: parseInt(admissionId) },
            include: {
                patient: {
                    include: {
                        medical_records: {
                            orderBy: { created_at: 'desc' },
                            take: 1
                        }
                    }
                },
                observations: {
                    orderBy: { timestamp: 'desc' }
                },
                medication_logs: {
                    orderBy: { given_at: 'desc' },
                    include: { prescription_item: { include: { medicine: true } } }
                }
            }
        });

        if (!admission) return res.status(404).json({ error: 'Admission not found' });

        // Also fetch Logic: Active Prescriptions for this patient?
        // Usually we fetch prescriptions linked to the CURRENT admission's medical record.
        // But for Simplicity in MVP: Fetch ALL active prescriptions for this patient.
        // Better: Fetch prescriptions from the MedicalRecord associated with this Admission?
        // Wait, Admission is linked to Patient, not directly MR. 
        // Logic: Find latest MR.

        const prescriptions = await prisma.prescription.findMany({
            where: {
                patient_id: admission.patient_id,
                status: { not: 'COMPLETED' } // Assuming active
            },
            include: {
                items: {
                    include: { medicine: true }
                }
            },
            orderBy: { created_at: 'desc' },
            take: 5
        });

        res.json({ admission, prescriptions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch clinical data' });
    }
};

// POST /api/inpatient/:admissionId/observation
exports.addObservation = async (req, res) => {
    const { admissionId } = req.params;
    const { nurse_name, vitals, notes } = req.body; // vitals = { systolic, diastolic, etc }

    try {
        const observation = await prisma.inpatientObservation.create({
            data: {
                admission_id: parseInt(admissionId),
                nurse_name,
                ...vitals,
                notes
            }
        });
        res.json(observation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add observation' });
    }
};

// POST /api/inpatient/:admissionId/mar
exports.logMedication = async (req, res) => {
    const { admissionId } = req.params;
    const { prescription_item_id, medicine_name, status, notes, nurse_name } = req.body;

    try {
        const log = await prisma.medicationLog.create({
            data: {
                admission_id: parseInt(admissionId),
                prescription_item_id: prescription_item_id ? parseInt(prescription_item_id) : null,
                medicine_name: medicine_name, // fallback
                status, // GIVEN, SKIPPED
                notes,
                given_by: nurse_name
            }
        });
        res.json(log);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to log medication' });
    }
};
