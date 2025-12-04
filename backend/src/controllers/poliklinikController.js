const { PrismaClient } = require('@prisma/client');

exports.getAll = async (req, res) => {
    const { prisma } = req;
    try {
        const polies = await prisma.poliklinik.findMany();
        res.json(polies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch poliklinik' });
    }
};

exports.create = async (req, res) => {
    const { prisma } = req;
    const { name, queue_code } = req.body;
    try {
        const poli = await prisma.poliklinik.create({
            data: { name, queue_code }
        });
        res.json(poli);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create poliklinik' });
    }
};

exports.update = async (req, res) => {
    const { prisma } = req;
    const { id } = req.params;
    const { name, queue_code } = req.body;
    try {
        const poli = await prisma.poliklinik.update({
            where: { id: parseInt(id) },
            data: { name, queue_code }
        });
        res.json(poli);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update poliklinik' });
    }
};

exports.delete = async (req, res) => {
    const { prisma } = req;
    const { id } = req.params;
    try {
        // Check for assigned doctors
        const doctorCount = await prisma.doctor.count({
            where: { poliklinik_id: parseInt(id) }
        });

        if (doctorCount > 0) {
            return res.status(400).json({ error: 'Cannot delete Poliklinik with assigned doctors' });
        }

        await prisma.poliklinik.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Poliklinik deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete poliklinik' });
    }
};
