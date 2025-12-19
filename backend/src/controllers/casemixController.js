const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Pending Casemix List
exports.getPendingCoding = async (req, res) => {
    try {
        // Find medical records where doctor has finished (e.g. has diagnosis) but no Casemix completion
        // OR existing Casemix records that are not CLAIMED

        const records = await prisma.medicalRecord.findMany({
            where: {
                assessment: { not: '' }, // Ensure doctor has filled diagnosis
                casemix: {
                    is: null // Not yet touched by Casemix
                }
            },
            include: {
                patient: true,
                doctor: true,
                icd10: true
            },
            orderBy: { visit_date: 'desc' },
            take: 50
        });

        // Also fetch "In Progress" coding
        const processing = await prisma.casemix.findMany({
            where: { status: { not: 'CLAIMED' } },
            include: {
                medical_record: {
                    include: { patient: true, doctor: true, icd10: true }
                }
            }
        });

        res.json({ new: records, processing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Save Coding & Grouping
exports.saveCoding = async (req, res) => {
    try {
        const { medical_record_id, primary_icd10, secondary_icd10s, procedures, user_name } = req.body;

        // Mock Grouping Logic (Real world: Call Grouper Library/DLL)
        const mockTariff = 2500000 + Math.floor(Math.random() * 1000000); // Random 2.5jt - 3.5jt
        const mockCBG = `Z-4-${Math.floor(Math.random() * 20)}-I`;

        const casemix = await prisma.casemix.upsert({
            where: { medical_record_id: parseInt(medical_record_id) },
            update: {
                primary_icd10,
                secondary_icd10s,
                procedures,
                ina_cbg_code: mockCBG,
                ina_cbg_desc: 'GROUP GENERATED (MOCK)',
                tariff: mockTariff,
                status: 'GROUPED',
                coder_name: user_name,
                coded_at: new Date()
            },
            create: {
                medical_record_id: parseInt(medical_record_id),
                primary_icd10,
                secondary_icd10s,
                procedures,
                ina_cbg_code: mockCBG,
                ina_cbg_desc: 'GROUP GENERATED (MOCK)',
                tariff: mockTariff,
                status: 'GROUPED',
                coder_name: user_name,
                coded_at: new Date()
            }
        });

        res.json(casemix);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Finalize & Generate Claim File
exports.generateClaimFile = async (req, res) => {
    try {
        const { id } = req.body; // Casemix ID

        await prisma.casemix.update({
            where: { id: parseInt(id) },
            data: { status: 'CLAIMED' }
        });

        // Mock File Generation
        res.json({ message: 'Claim File Generated', url: '/params/claim/CLAIM-123.txt' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
