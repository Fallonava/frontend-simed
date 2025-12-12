const { PrismaClient } = require('@prisma/client');

exports.create = async (req, res) => {
    const { prisma } = req;
    const { patient_id, doctor_id, queue_id, subjective, objective, assessment, plan, visit_date } = req.body;

    try {
        const record = await prisma.medicalRecord.create({
            data: {
                patient_id: parseInt(patient_id),
                doctor_id: parseInt(doctor_id),
                queue_id: queue_id ? parseInt(queue_id) : null,
                visit_date: visit_date ? new Date(visit_date) : new Date(),
                subjective,
                objective,
                assessment,
                plan,
                systolic: req.body.systolic ? parseInt(req.body.systolic) : null,
                diastolic: req.body.diastolic ? parseInt(req.body.diastolic) : null,
                heart_rate: req.body.heart_rate ? parseInt(req.body.heart_rate) : null,
                temperature: req.body.temperature ? parseFloat(req.body.temperature) : null,
                weight: req.body.weight ? parseFloat(req.body.weight) : null,
                height: req.body.height ? parseFloat(req.body.height) : null
            },
            include: {
                patient: true,
                doctor: true
            }
        });

        // Optionally update queue status to SERVED if linked to a queue
        if (queue_id) {
            await prisma.queue.update({
                where: { id: parseInt(queue_id) },
                data: { status: 'SERVED' }
            });
            // Emit socket update
            req.io.emit('queue_update');
        }

        res.status(201).json(record);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create medical record' });
    }
};

exports.getByPatient = async (req, res) => {
    const { prisma } = req;
    const { patient_id } = req.params;

    try {
        const records = await prisma.medicalRecord.findMany({
            where: { patient_id: parseInt(patient_id) },
            include: {
                doctor: true
            },
            orderBy: { visit_date: 'desc' }
        });
        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch medical records' });
    }
};

exports.getHistory = async (req, res) => {
    const { prisma } = req;
    const { patient_id } = req.query;

    if (!patient_id) {
        return res.status(400).json({ error: 'patient_id is required' });
    }

    try {
        const records = await prisma.medicalRecord.findMany({
            where: { patient_id: parseInt(patient_id) },
            include: {
                doctor: true
            },
            orderBy: { visit_date: 'desc' }
        });
        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch medical records' });
    }
};
