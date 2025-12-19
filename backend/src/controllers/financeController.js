const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/finance/generate
// Manual Trigger or Auto-trigger on Dishcarge/Prescription
exports.createInvoice = async (req, res) => {
    const { patientId, admissionId, medicalRecordId, items } = req.body;
    try {
        const total = items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);

        const invoice = await prisma.invoice.create({
            data: {
                patient_id: parseInt(patientId),
                admission_id: admissionId ? parseInt(admissionId) : null,
                medical_record_id: medicalRecordId ? parseInt(medicalRecordId) : null,
                total_amount: total,
                status: 'PENDING',
                items: {
                    create: items.map(i => ({
                        description: i.description,
                        amount: i.amount,
                        quantity: i.quantity
                    }))
                }
            },
            include: { items: true }
        });
        res.json({ success: true, data: invoice });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
};

// GET /api/finance/unpaid
exports.getUnpaidInvoices = async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            where: { status: 'PENDING' },
            include: {
                patient: true,
                items: true,
                admission: { include: { bed: { include: { room: true } } } }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json({ success: true, data: invoices });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};

// POST /api/finance/pay/:id
exports.payInvoice = async (req, res) => {
    const { id } = req.params;
    const { method } = req.body; // CASH, QRIS, CARD
    try {
        const invoice = await prisma.invoice.update({
            where: { id: parseInt(id) },
            data: {
                status: 'PAID',
                payment_method: method,
                updated_at: new Date()
            }
        });
        res.json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ error: 'Payment failed' });
    }
};

// GET /api/finance/report
exports.getDailyReport = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const paidInvoices = await prisma.invoice.findMany({
            where: {
                status: 'PAID',
                updated_at: { gte: startOfDay }
            },
            include: { patient: true }
        });

        const totalIncome = paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
        const methodBreakdown = paidInvoices.reduce((acc, inv) => {
            acc[inv.payment_method] = (acc[inv.payment_method] || 0) + inv.total_amount;
            return acc;
        }, {});

        res.json({ success: true, totalIncome, transactionCount: paidInvoices.length, methodBreakdown, transactions: paidInvoices });
    } catch (error) {
        res.status(500).json({ error: 'Report failed' });
    }
};

// ANALYTICS: Revenue Trend (Last 7 Days)
exports.getAnalytics = async (req, res) => {
    try {
        // We want a chart data: [ { date: '2023-10-01', revenue: 500000 }, ... ]
        // Prisma doesn't have easy "GROUP BY DATE()" for SQLite/Postgres seamlessly without raw query.
        // For simplicity: Fetch all PAID invoices in last 7 days and aggregate in JS.

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const invoices = await prisma.invoice.findMany({
            where: {
                status: 'PAID',
                created_at: {
                    gte: sevenDaysAgo
                }
            }
        });

        const dailyRevenue = {};

        // Initialize last 7 days with 0
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyRevenue[dateStr] = 0;
        }

        // Aggregate
        invoices.forEach(inv => {
            const dateStr = inv.created_at.toISOString().split('T')[0];
            if (dailyRevenue[dateStr] !== undefined) {
                dailyRevenue[dateStr] += inv.total_amount;
            }
        });

        const chartData = Object.entries(dailyRevenue)
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort ascending

        res.json({ success: true, chart_data: chartData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate analytics' });
    }
};
