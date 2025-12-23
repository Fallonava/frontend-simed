const { PrismaClient } = require('@prisma/client');
const rmService = require('../services/rmService');
const prisma = new PrismaClient();

// Search Patient
exports.search = async (req, res) => {
    const { q } = req.query; // Query: NIK, Name, or RM

    if (!q) return res.json([]);

    try {
        const patients = await prisma.patient.findMany({
            where: {
                OR: [
                    { nik: { contains: q } },
                    { no_rm: { contains: q } },
                    { name: { contains: q, mode: 'insensitive' } }
                ]
            },
            take: 10
        });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
};

const fs = require('fs');
const path = require('path');

// Create New Patient
exports.create = async (req, res) => {
    const { nik, name, gender, birth_date, address, phone, bpjs_no } = req.body;

    // Debug Log
    fs.appendFileSync(path.join(__dirname, '../../debug_patient.log'),
        `\n[${new Date().toISOString()}] Request Body: ${JSON.stringify(req.body)}`
    );

    try {
        // 1. Check if NIK exists
        const existing = await prisma.patient.findUnique({ where: { nik } });
        if (existing) {
            return res.status(400).json({ error: 'Patient with this NIK already exists' });
        }

        // 2. Generate RM
        const no_rm = await rmService.generateNextRM();

        // 3. Create
        const patient = await prisma.patient.create({
            data: {
                nik,
                no_rm,
                name,
                gender,
                birth_date: new Date(birth_date),
                address,
                phone,
                bpjs_no,
                allergies: req.body.allergies
            }
        });

        res.status(201).json(patient);
    } catch (error) {
        fs.appendFileSync(path.join(__dirname, '../../debug_patient.log'),
            `\n[${new Date().toISOString()}] Error: ${error.message}\nStack: ${error.stack}`
        );
        console.error(error);
        res.status(500).json({ error: `Server Error: ${error.message}` });
    }
};

// Get All (Paginated)
exports.getAll = async (req, res) => {
    const { page = 1, limit = 50, q = '' } = req.query;
    const skip = (page - 1) * limit;

    try {
        const where = q ? {
            OR: [
                { nik: { contains: q } },
                { no_rm: { contains: q } },
                { name: { contains: q, mode: 'insensitive' } }
            ]
        } : {};

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { created_at: 'desc' }
            }),
            prisma.patient.count({ where })
        ]);

        res.json({
            data: patients,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
};

// Get Single by ID (with History)
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const patient = await prisma.patient.findUnique({
            where: { id: parseInt(id) },
            include: {
                medical_records: {
                    include: { doctor: true },
                    orderBy: { created_at: 'desc' }
                },
                admissions: {
                    where: { status: { in: ['ACTIVE', 'DISCHARGE_INITIATED'] } },
                    include: { bed: { include: { room: true } } },
                    orderBy: { created_at: 'desc' },
                    take: 1
                },
                queues: {

                    orderBy: { created_at: 'desc' },
                    take: 10 // Last 10 visits
                }
            }
        });

        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patient details' });
    }
};

// Update Patient
exports.update = async (req, res) => {
    const { id } = req.params;
    const { name, nik, gender, birth_date, address, phone, bpjs_no } = req.body;

    try {
        const updated = await prisma.patient.update({
            where: { id: parseInt(id) },
            data: {
                name,
                nik,
                gender,
                birth_date: new Date(birth_date),
                address,
                phone,
                bpjs_no,
                allergies: req.body.allergies
            }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
};

// Delete Patient
exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        const patientId = parseInt(id);

        // Check for existing relations
        const relatedRecords = await prisma.medicalRecord.count({ where: { patient_id: patientId } });
        const relatedQueues = await prisma.queue.count({ where: { patient_id: patientId } });

        if (relatedRecords > 0 || relatedQueues > 0) {
            return res.status(400).json({ error: 'Cannot delete patient with existing medical records or visits.' });
        }

        await prisma.patient.delete({ where: { id: patientId } });
        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete patient' });
    }
};
