const { PrismaClient } = require('@prisma/client');

// --- ANATOMIC PATHOLOGY ---
exports.receiveSample = async (req, res) => {
    const { prisma } = req;
    const { service_order_id, sample_type, organ_source } = req.body;
    try {
        const sample = await prisma.pASample.create({
            data: {
                service_order_id: parseInt(service_order_id),
                sample_type,
                organ_source,
                status: 'RECEIVED'
            }
        });
        await prisma.pAWorkflow.create({
            data: { sample_id: sample.id, step: 'RECEIVED', performed_by: req.user.username }
        });
        res.status(201).json(sample);
    } catch (error) {
        res.status(500).json({ error: 'Failed to receive sample' });
    }
};

exports.updateWorkflow = async (req, res) => {
    const { prisma } = req;
    const { id } = req.params;
    const { step, details } = req.body;
    try {
        await prisma.pAWorkflow.create({
            data: { sample_id: parseInt(id), step, performed_by: req.user.username }
        });
        const updated = await prisma.pASample.update({
            where: { id: parseInt(id) },
            data: { status: step, ...details }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update workflow' });
    }
};

// --- BLOOD BANK ---
exports.getBloodInventory = async (req, res) => {
    const { prisma } = req;
    try {
        const inventory = await prisma.bloodBag.findMany({
            where: { status: 'AVAILABLE' },
            orderBy: { expiry_date: 'asc' } // FIFO
        });
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blood inventory' });
    }
};

exports.crossmatch = async (req, res) => {
    const { prisma } = req;
    const { bag_id, patient_id, result, notes } = req.body;
    try {
        const cm = await prisma.bloodCrossmatch.create({
            data: {
                bag_id: parseInt(bag_id),
                patient_id: parseInt(patient_id),
                result,
                notes,
                performed_by: req.user.username
            }
        });

        if (result === 'COMPATIBLE') {
            await prisma.bloodBag.update({
                where: { id: parseInt(bag_id) },
                data: { status: 'RESERVED' }
            });
        }

        res.json(cm);
    } catch (error) {
        res.status(500).json({ error: 'Crossmatch failed' });
    }
};

// --- CSSD ---
exports.updateSetStatus = async (req, res) => {
    const { prisma } = req;
    const { qr_code, activity, machine_id } = req.body;
    try {
        const set = await prisma.sterileSet.findUnique({ where: { qr_code } });
        if (!set) return res.status(404).json({ error: 'Instrument set not found' });

        let nextStatus = 'WASHING';
        let expiryDate = null;
        if (activity === 'STERILE') {
            nextStatus = 'READY';
            expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7); // 7 days expiry
        }

        const updatedSet = await prisma.sterileSet.update({
            where: { id: set.id },
            data: {
                status: nextStatus,
                last_sterile_at: activity === 'STERILE' ? new Date() : set.last_sterile_at,
                expiry_date: expiryDate
            }
        });

        await prisma.sterileCycle.create({
            data: {
                set_id: set.id,
                activity,
                machine_id,
                operator: req.user.username
            }
        });

        res.json(updatedSet);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update CSSD set' });
    }
};
