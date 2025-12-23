const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- Template Management ---

exports.createTemplate = async (req, res) => {
    const { name, code, description, category, schema } = req.body;
    try {
        const template = await prisma.formTemplate.create({
            data: { name, code, description, category, schema }
        });
        res.json(template);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create template' });
    }
};

exports.getTemplates = async (req, res) => {
    const { category } = req.query;
    try {
        const templates = await prisma.formTemplate.findMany({
            where: category ? { category, isActive: true } : { isActive: true },
            orderBy: { name: 'asc' }
        });
        res.json(templates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
};

exports.updateTemplate = async (req, res) => {
    const { id } = req.params;
    const { name, description, category, schema, isActive } = req.body;
    try {
        const template = await prisma.formTemplate.update({
            where: { id: parseInt(id) },
            data: { name, description, category, schema, isActive }
        });
        res.json(template);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update template' });
    }
};

// --- Response Handling ---

exports.submitResponse = async (req, res) => {
    const {
        template_id,
        patient_id,
        medical_record_id,
        admission_id,
        data,
        submitted_by,
        observation_time
    } = req.body;

    try {
        const response = await prisma.formResponse.create({
            data: {
                template_id: parseInt(template_id),
                patient_id: parseInt(patient_id),
                medical_record_id: medical_record_id ? parseInt(medical_record_id) : null,
                admission_id: admission_id ? parseInt(admission_id) : null,
                data,
                submitted_by,
                observation_time: observation_time ? new Date(observation_time) : new Date()
            }
        });
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit form response' });
    }
};

exports.getResponses = async (req, res) => {
    const { patient_id, medical_record_id, admission_id, template_code } = req.query;

    try {
        const where = {};
        if (patient_id) where.patient_id = parseInt(patient_id);
        if (medical_record_id) where.medical_record_id = parseInt(medical_record_id);
        if (admission_id) where.admission_id = parseInt(admission_id);
        if (template_code) {
            where.template = { code: template_code };
        }

        const responses = await prisma.formResponse.findMany({
            where,
            include: { template: true },
            orderBy: { observation_time: 'desc' }
        });
        res.json(responses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch responses' });
    }
};
