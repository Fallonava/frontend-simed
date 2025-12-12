const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
    try {
        const playlist = await prisma.playlist.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(playlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch playlist' });
    }
};

exports.create = async (req, res) => {
    const { type, url, duration, order } = req.body;
    try {
        const newItem = await prisma.playlist.create({
            data: {
                type,
                url,
                duration: parseInt(duration) || 10,
                order: parseInt(order) || 0
            }
        });
        req.io.emit('playlist_update'); // Notify clients
        res.json(newItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create playlist item' });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { type, url, duration, order, isActive } = req.body;
    try {
        const updatedItem = await prisma.playlist.update({
            where: { id: parseInt(id) },
            data: {
                type,
                url,
                duration: parseInt(duration),
                order: parseInt(order),
                isActive
            }
        });
        req.io.emit('playlist_update');
        res.json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update playlist item' });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.playlist.delete({
            where: { id: parseInt(id) }
        });
        req.io.emit('playlist_update');
        res.json({ message: 'Item deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete playlist item' });
    }
};
