const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get All Beds (Hierarchical View)
exports.getAllBeds = async (req, res) => {
    try {
        // Group by Class (VIP, KELAS_1, etc via Room Type)
        // We fetch all rooms with beds and admission info
        const rooms = await prisma.room.findMany({
            include: {
                beds: {
                    include: {
                        current_patient: true,
                        admissions: {
                            where: { status: 'ACTIVE' },
                            take: 1
                        }
                    },
                    orderBy: { code: 'asc' }
                }
            },
            orderBy: { name: 'asc' }
        });

        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Bed Status (e.g. Clean after discharge)
exports.updateBedStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // AVAILABLE, CLEANING, MTC

        const bed = await prisma.bed.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.json(bed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Dashboard Stats
exports.getStats = async (req, res) => {
    try {
        const total = await prisma.bed.count();
        const occupied = await prisma.bed.count({ where: { status: 'OCCUPIED' } });
        const cleaning = await prisma.bed.count({ where: { status: 'CLEANING' } });
        const available = await prisma.bed.count({ where: { status: 'AVAILABLE' } });

        res.json({
            total,
            occupied,
            cleaning,
            available,
            occupancy_rate: Math.round((occupied / total) * 100)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
