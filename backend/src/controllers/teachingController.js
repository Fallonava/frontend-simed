const { PrismaClient } = require('@prisma/client');

exports.verifyRecord = async (req, res) => {
    const { prisma } = req;
    const { id } = req.params;
    const { feedback } = req.body;
    const verifierId = req.user.id;

    if (req.user.role !== 'DPJP' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only DPJP can verify records' });
    }

    try {
        const record = await prisma.medicalRecord.update({
            where: { id: parseInt(id) },
            data: {
                status: 'FINAL',
                verified_by_id: verifierId
            },
            include: {
                patient: true,
                doctor: true
            }
        });

        // Auto-populate Logbook for the creator
        if (record.created_by_id) {
            await prisma.logbookEntry.create({
                data: {
                    user_id: record.created_by_id,
                    patient_id: record.patient_id,
                    activity_type: 'Clinical Encounter',
                    role: 'Primary Informant',
                    medical_record_id: record.id,
                    is_verified: true,
                    verified_by_id: verifierId
                }
            });
        }

        res.json({ message: 'Record verified and logbook updated', record });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to verify record' });
    }
};

exports.getLogbook = async (req, res) => {
    const { prisma } = req;
    const userId = req.user.id;

    try {
        const entries = await prisma.logbookEntry.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
        res.json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch logbook' });
    }
};

exports.createAssessment = async (req, res) => {
    const { prisma } = req;
    const { medical_record_id, student_id, type, scores, feedback } = req.body;
    const supervisorId = req.user.id;

    try {
        const assessment = await prisma.clinicalAssessment.create({
            data: {
                medical_record_id: parseInt(medical_record_id),
                student_id: parseInt(student_id),
                supervisor_id: supervisorId,
                type,
                scores: scores || {},
                feedback
            }
        });
        res.status(201).json(assessment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create assessment' });
    }
};

exports.getAnonymizedData = async (req, res) => {
    const { prisma } = req;
    const { category, startDate, endDate } = req.query;

    try {
        const records = await prisma.medicalRecord.findMany({
            where: {
                visit_date: {
                    gte: startDate ? new Date(startDate) : undefined,
                    lte: endDate ? new Date(endDate) : undefined
                }
            },
            include: {
                patient: {
                    select: {
                        gender: true,
                        dob: true
                        // Exclude Name, NIK, etc.
                    }
                }
            }
        });

        // Simple anonymization: mapping records to a cleaner format
        const anonymized = records.map(r => ({
            id: `CASE-${r.id}`, // Obfuscate ID
            age: calculateAge(r.patient.dob),
            gender: r.patient.gender,
            visit_date: r.visit_date,
            assessment: r.assessment, // Clinical data
            plan: r.plan
        }));

        res.json(anonymized);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to export Research data' });
    }
};

function calculateAge(dob) {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}
