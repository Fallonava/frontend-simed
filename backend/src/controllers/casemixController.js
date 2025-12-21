const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Dashboard Data (Separated Queues)
exports.getPendingCoding = async (req, res) => {
    try {
        // 1. Coding Queue: Doctor has finished (diagnosis exists) but NO Casemix entry yet
        const codingQueue = await prisma.medicalRecord.findMany({
            where: {
                assessment: { not: '' },
                casemix: { is: null }
            },
            include: {
                patient: true,
                doctor: true,
                icd10: true
            },
            orderBy: { visit_date: 'asc' }, // Oldest first
            take: 50
        });

        // 2. Grouping/Revision Queue: Casemix entry exists but NOT finalized (GROUPED but maybe needs check, or PENDING/CODED)
        // In this simple flow: "GROUPED" means ready for CLAIM. "CODED" isn't a separate state here, we go straight to GROUPED.
        // So we look for status = 'GROUPED'
        const groupedQueue = await prisma.casemix.findMany({
            where: { status: 'GROUPED' },
            include: {
                medical_record: {
                    include: { patient: true, doctor: true, icd10: true }
                }
            },
            orderBy: { coded_at: 'desc' }
        });

        // 3. Claims History: status = 'CLAIMED'
        const claimedHistory = await prisma.casemix.findMany({
            where: { status: 'CLAIMED' },
            include: {
                medical_record: {
                    include: { patient: true, doctor: true }
                }
            },
            orderBy: { updated_at: 'desc' },
            take: 20
        });

        res.json({
            coding_queue: codingQueue,
            grouped_queue: groupedQueue,
            claimed_history: claimedHistory
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Run Grouper & Save
exports.saveCoding = async (req, res) => {
    try {
        const { medical_record_id, primary_icd10, secondary_icd10s, procedures, user_name } = req.body;

        // --- MOCK GROUPER LOGIC ---
        // Simulate severity based on number of secondary dx
        const secondaryCount = secondary_icd10s ? secondary_icd10s.split(',').length : 0;
        let severity = 'I';
        if (secondaryCount > 2) severity = 'II';
        if (secondaryCount > 4) severity = 'III';

        // Base tariff randomizer
        const baseTariff = 2500000;
        const severityMultiplier = { 'I': 1, 'II': 1.5, 'III': 2.5 };
        const finalTariff = Math.floor((baseTariff * severityMultiplier[severity]) + (Math.random() * 500000));

        // Mock CBG Code based on alphabet of primary ICD
        const letter = primary_icd10.charAt(0).toUpperCase();
        const cbgCode = `${letter}-4-15-${severity}`;
        const cbgDesc = `Code Group ${letter} - Severity ${severity} (MOCK)`;
        // --------------------------

        const casemix = await prisma.casemix.upsert({
            where: { medical_record_id: parseInt(medical_record_id) },
            update: {
                primary_icd10,
                secondary_icd10s,
                procedures,
                ina_cbg_code: cbgCode,
                ina_cbg_desc: cbgDesc,
                tariff: finalTariff,
                status: 'GROUPED',
                coder_name: user_name,
                coded_at: new Date()
            },
            create: {
                medical_record_id: parseInt(medical_record_id),
                primary_icd10,
                secondary_icd10s,
                procedures,
                ina_cbg_code: cbgCode,
                ina_cbg_desc: cbgDesc,
                tariff: finalTariff,
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

        const claim = await prisma.casemix.update({
            where: { id: parseInt(id) },
            data: { status: 'CLAIMED' },
            include: {
                medical_record: {
                    include: { patient: true }
                }
            }
        });

        // Generate Mock TXT content for user to "download"
        // Format: NO_SEP|CARD_NO|ADMISSION_DATE|DISCHARGE_DATE|ICD10|TARIFF
        const txtParams = [
            `SEP-${Date.now()}`,
            claim.medical_record.patient.bpjs_card_no || '00000000000',
            claim.medical_record.visit_date.toISOString().split('T')[0],
            new Date().toISOString().split('T')[0],
            claim.primary_icd10,
            Math.floor(claim.tariff)
        ].join('|');

        res.json({
            message: 'Claim Finalized',
            file_content: txtParams,
            filename: `CLAIM-${claim.medical_record.patient.no_rm}-${Date.now()}.txt`
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
