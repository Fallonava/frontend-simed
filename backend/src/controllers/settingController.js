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
    try {
        const updates = req.body;
        const results = [];

        for (const [key, value] of Object.entries(updates)) {
            // Skip system fields if any (though unlikely in req.body)
            if (key === 'id') continue;

            const setting = await prisma.setting.upsert({
                where: { key: key },
                update: { value: String(value) },
                create: { key: key, value: String(value) }
            });
            results.push(setting);

            // Broadcast update via Socket.io
            req.io.emit('setting_update', { key, value: String(value) });
        }

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
