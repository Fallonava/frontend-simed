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
                subjective: subjective || '',
                objective: objective || '',
                assessment: assessment || '',
                plan: plan || '',
                systolic: req.body.systolic ? parseInt(req.body.systolic) : null,
                diastolic: req.body.diastolic ? parseInt(req.body.diastolic) : null,
                heart_rate: req.body.heart_rate ? parseInt(req.body.heart_rate) : null,
                temperature: req.body.temperature ? parseFloat(req.body.temperature) : null,
                weight: req.body.weight ? parseFloat(req.body.weight) : null,
                height: req.body.height ? parseFloat(req.body.height) : null,
                disposition: req.body.disposition || null,
                icd10_code: req.body.icd10_code || null,

                // Teaching Hospital Logic
                status: req.user.role === 'KOAS' ? 'DRAFT' : (req.user.role === 'RESIDENT' ? 'PROVISIONAL' : 'FINAL'),
                created_by_id: req.user.id
            },
            include: {
                patient: true,
                doctor: true
            }
        });

        // REMOVED: Do not auto-complete queue here. Let the frontend/doctor decide when to call /complete
        // if (queue_id) {
        //    await prisma.queue.update({ ... status: 'SERVED' });
        // }

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

exports.getAll = async (req, res) => {
    const { prisma } = req;
    const { search, status } = req.query;

    try {
        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { patient: { name: { contains: search } } },
                { patient: { no_rm: { contains: search } } }
            ];
        }

        const records = await prisma.medicalRecord.findMany({
            where,
            include: {
                patient: true,
                doctor: true,
                prescriptions: { include: { items: { include: { medicine: true } } } },
                service_orders: true,
                casemix: true
            },
            orderBy: { visit_date: 'desc' },
            take: 100
        });
        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch all records' });
    }
};

exports.signRecord = async (req, res) => {
    const { prisma } = req;
    const { id } = req.params;
    const { doctor_id } = req.body;

    try {
        const TTEProvider = require('../utils/TTEProvider');

        // 1. Get the medical record
        const record = await prisma.medicalRecord.findUnique({
            where: { id: parseInt(id) },
            include: {
                patient: true,
                doctor: true
            }
        });

        if (!record) {
            return res.status(404).json({ error: 'Medical record not found' });
        }

        // 2. Generate PDF buffer (simplified mock - in production use pdfkit or puppeteer)
        const documentBuffer = Buffer.from(`MEDICAL RECORD #${record.id} - ${record.patient.name}`);

        // 3. Sign with TTE Provider
        const signResult = await TTEProvider.signDocument(documentBuffer, {
            name: record.doctor.name,
            nik: record.doctor.nik || '1234567890123456',
            specialist: record.doctor.specialist
        });

        if (!signResult.success) {
            return res.status(500).json({ error: 'TTE Signing Failed' });
        }

        // 4. Update record with signature metadata
        const updated = await prisma.medicalRecord.update({
            where: { id: parseInt(id) },
            data: {
                is_signed: true,
                signed_at: new Date(),
                tte_metadata: signResult.metadata,
                status: 'FINAL'
            }
        });

        // 5. Lock the record by marking queue as SERVED
        if (record.queue_id) {
            await prisma.queue.update({
                where: { id: record.queue_id },
                data: { status: 'SERVED' }
            });
        }

        res.json({
            success: true,
            record: updated,
            signature: signResult.metadata
        });

    } catch (error) {
        console.error('TTE Signing Error:', error);
        res.status(500).json({ error: 'Failed to sign medical record' });
    }
};
