const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/nutrition/menus
exports.getMenus = async (req, res) => {
    try {
        const menus = await prisma.dietMenu.findMany({ orderBy: { type: 'asc' } });
        res.json({ success: true, data: menus });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch menus' });
    }
};

// POST /api/nutrition/order
exports.createOrder = async (req, res) => {
    const { admissionId, dietMenuId, mealTime, extras } = req.body;
    try {
        const order = await prisma.dietOrder.create({
            data: {
                admission_id: parseInt(admissionId),
                diet_menu_id: parseInt(dietMenuId),
                meal_time: mealTime, // 'BREAKFAST', 'LUNCH', 'DINNER'
                extras,
                status: 'ORDERED'
            }
        });
        res.json({ success: true, data: order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create diet order' });
    }
};

// GET /api/nutrition/kitchen (Active Orders Today)
exports.getKitchenOrders = async (req, res) => {
    try {
        // Fetch orders for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const orders = await prisma.dietOrder.findMany({
            where: {
                date: { gte: startOfDay }
            },
            include: {
                diet_menu: true,
                admission: {
                    include: {
                        patient: true,
                        bed: { include: { room: true } }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        // Grouping for "Production List"
        // e.g. "Bubur Halus: 5 portions"
        const summary = orders.reduce((acc, curr) => {
            const menu = curr.diet_menu.name;
            acc[menu] = (acc[menu] || 0) + 1;
            return acc;
        }, {});

        res.json({ success: true, orders, summary });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch kitchen orders' });
    }
};

// PUT /api/nutrition/order/:id/status
exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'PREPARED', 'DELIVERED'
    try {
        const order = await prisma.dietOrder.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
};
