const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get All Beds (Hierarchical View: Room > Bed)
exports.getAllBeds = async (req, res) => {
    try {
        const rooms = await prisma.room.findMany({
            include: {
                beds: {
                    include: {
                        current_patient: true,
                        admissions: { where: { status: 'ACTIVE' }, take: 1 }
                    },
                    orderBy: { code: 'asc' }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json(rooms); // Returns Rooms with nested Beds
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create Room
exports.createRoom = async (req, res) => {
    try {
        const { name, type, price, gender } = req.body;
        const room = await prisma.room.create({
            data: { name, type, price, gender }
        });
        res.status(201).json(room);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update Room
exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, price, gender } = req.body;
        const room = await prisma.room.update({
            where: { id: parseInt(id) },
            data: { name, type, price, gender }
        });
        res.json(room);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete Room
exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.room.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Room deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Cannot delete room with active beds or admissions' });
    }
};

// Create Bed
exports.createBed = async (req, res) => {
    try {
        const { roomId, code } = req.body;
        const bed = await prisma.bed.create({
            data: {
                room_id: parseInt(roomId),
                code,
                status: 'AVAILABLE'
            }
        });
        res.status(201).json(bed);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete Bed
exports.deleteBed = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.bed.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Bed deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Cannot delete bed if occupied or has history' });
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
            occupancy_rate: total ? Math.round((occupied / total) * 100) : 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
