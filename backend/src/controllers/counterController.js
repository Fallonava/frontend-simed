const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
    try {
        const counters = await prisma.counter.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(counters);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch counters' });
    }
};

exports.create = async (req, res) => {
    const { name } = req.body;
    try {
        const counter = await prisma.counter.create({
            data: { name }
        });
        res.json(counter);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create counter' });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const counter = await prisma.counter.update({
            where: { id: parseInt(id) },
            data: { name }
        });
        res.json(counter);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update counter' });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.counter.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Counter deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete counter' });
    }
};
