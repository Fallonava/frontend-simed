const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSettings = async (req, res) => {
    try {
        const settings = await prisma.setting.findMany();
        // Convert to object for easier frontend consumption: { key: value }
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        res.json(settingsMap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

exports.updateSetting = async (req, res) => {
    const { key, value } = req.body;
    try {
        const setting = await prisma.setting.upsert({
            where: { key: key },
            update: { value: value },
            create: { key: key, value: value }
        });

        // Broadcast update via Socket.io
        req.io.emit('setting_update', { key, value });

        res.json(setting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update setting' });
    }
};
