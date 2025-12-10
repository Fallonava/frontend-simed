const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get All Medicines
exports.getAll = async (req, res) => {
    const { q } = req.query;
    try {
        const query = q ? {
            OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { code: { contains: q, mode: 'insensitive' } },
                { category: { contains: q, mode: 'insensitive' } }
            ]
        } : {};

        const medicines = await prisma.medicine.findMany({
            where: query,
            orderBy: { name: 'asc' }
        });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch medicines' });
    }
};

// Create Medicine
exports.create = async (req, res) => {
    const { name, code, category, stock, unit, price, expiry } = req.body;
    try {
        const medicine = await prisma.medicine.create({
            data: {
                name,
                code,
                category,
                stock: parseInt(stock),
                unit,
                price: parseFloat(price),
                expiry: expiry ? new Date(expiry) : null
            }
        });
        res.status(201).json(medicine);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create medicine' });
    }
};

// Update Medicine
exports.update = async (req, res) => {
    const { id } = req.params;
    const { name, code, category, stock, unit, price, expiry } = req.body;
    try {
        const medicine = await prisma.medicine.update({
            where: { id: parseInt(id) },
            data: {
                name,
                code,
                category,
                stock: parseInt(stock),
                unit,
                price: parseFloat(price),
                expiry: expiry ? new Date(expiry) : null
            }
        });
        res.json(medicine);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update medicine' });
    }
};

// Delete Medicine
exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.medicine.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Medicine deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete medicine' });
    }
};
