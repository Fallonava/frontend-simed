const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/icd10?q=fever
exports.search = async (req, res) => {
    const { q } = req.query;
    try {
        const results = await prisma.ICD10.findMany({
            where: {
                OR: [
                    { code: { contains: q || '', mode: 'insensitive' } },
                    { name: { contains: q || '', mode: 'insensitive' } }
                ]
            },
            take: 20
        });
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Search failed' });
    }
};

exports.getAll = async (req, res) => {
    try {
        const results = await prisma.ICD10.findMany({ take: 100 });
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};
