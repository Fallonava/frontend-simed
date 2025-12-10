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
                bpjs_no
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
