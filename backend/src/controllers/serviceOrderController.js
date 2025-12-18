const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/service-orders
exports.create = async (req, res) => {
    const { medical_record_id, type, notes } = req.body;
    try {
        const order = await prisma.serviceOrder.create({
            data: {
                medical_record_id,
                type, // 'LAB', 'RAD', 'PHARMACY'
                notes,
                status: 'PENDING'
            }
        });
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create service order' });
    }
};

// GET /api/service-orders?type=LAB
exports.getAll = async (req, res) => {
    const { type } = req.query;
    try {
        const orders = await prisma.serviceOrder.findMany({
            where: {
                type: type ? type : undefined,
                status: 'PENDING' // Default dashboard view usually pending
            },
            include: {
                medical_record: {
                    include: {
                        patient: true,
                        doctor: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status, result } = req.body;
    try {
        const updated = await prisma.serviceOrder.update({
            where: { id: parseInt(id) },
            data: { status, result }
        });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};
