const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Pending Orders (LAB or RAD)
exports.getPendingOrders = async (req, res) => {
    try {
        const { type } = req.query; // 'LAB' or 'RAD'
        const orders = await prisma.serviceOrder.findMany({
            where: {
                type,
                status: 'ORDERED'
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
        res.status(500).json({ error: error.message });
    }
};

// Submit Result (Lab/Rad)
exports.submitResult = async (req, res) => {
    try {
        const { id } = req.params;
        const { result_data, notes, technician_name } = req.body;

        // result_data is JSON string of values (Hb, Leukocyte, etc)
        // or Image URL for Radiology

        const order = await prisma.serviceOrder.update({
            where: { id: parseInt(id) },
            data: {
                status: 'COMPLETED',
                result: typeof result_data === 'object' ? JSON.stringify(result_data) : result_data,
                updated_at: new Date()
            }
        });

        // Optional: Create a separate 'Result' record if schema existed,
        // but ServiceOrder.result field is sufficient for MVP.

        res.json({ message: 'Result Submitted', order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
