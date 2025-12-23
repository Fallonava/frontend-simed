const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
    try {
        const tariffs = await prisma.serviceTariff.findMany({ orderBy: { name: 'asc' } });
        res.json(tariffs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tariffs' });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, category, price, unit, code } = req.body;
        const tariff = await prisma.serviceTariff.create({
            data: { name, category, price, unit, code }
        });
        res.status(201).json(tariff);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, unit, code } = req.body;
        const tariff = await prisma.serviceTariff.update({
            where: { id: parseInt(id) },
            data: { name, category, price, unit, code }
        });
        res.json(tariff);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.serviceTariff.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Tariff deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete tariff' });
    }
};
