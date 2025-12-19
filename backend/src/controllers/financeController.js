const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/finance/generate
// Manual Trigger or Auto-trigger on Dishcarge/Prescription
// GET /api/finance/billables
// Fetch completed medical records that haven't been invoiced yet
exports.getBillableVisits = async (req, res) => {
    try {
        const records = await prisma.medicalRecord.findMany({
            where: {
                assessment: { not: '' }, // Completed visit
                invoices: { none: {} }   // No invoice generated yet
            },
            include: {
                patient: true,
                doctor: true,
                prescriptions: { include: { items: { include: { medicine: true } } } },
                service_orders: true
            },
            orderBy: { visit_date: 'desc' }
        });
        res.json({ success: true, data: records });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch billable visits' });
    }
};

// POST /api/finance/generate
// Auto-generate invoice from Medical Record
exports.createInvoice = async (req, res) => {
    const { medicalRecordId } = req.body; // Only need MR ID now

    try {
        // Fetch full record details
        const record = await prisma.medicalRecord.findUnique({
            where: { id: parseInt(medicalRecordId) },
            include: {
                doctor: true,
                patient: true,
                prescriptions: { include: { items: { include: { medicine: true } } } },
                service_orders: true
            }
        });

        if (!record) return res.status(404).json({ error: 'Medical Record not found' });

        // Check if invoice already exists
        const existing = await prisma.invoice.findFirst({ where: { medical_record_id: parseInt(medicalRecordId) } });
        if (existing) return res.status(400).json({ error: 'Invoice already exists for this visit' });

        // Calculate Bill
        let total = 0;
        const items = [];

        // 1. Registration / Admin Fee
        const adminFee = 15000;
        total += adminFee;
        items.push({ description: 'Biaya Administrasi RS', amount: adminFee, quantity: 1 });

        // 2. Doctor Fee
        const docFee = record.doctor.specialist.includes('Umum') ? 35000 : 75000; // GP vs Specialist
        total += docFee;
        items.push({ description: `Jasa Dokter (${record.doctor.name})`, amount: docFee, quantity: 1 });

        // 3. Medicines
        if (record.prescriptions?.length > 0) {
            record.prescriptions.forEach(p => {
                p.items.forEach(item => {
                    const cost = item.medicine.price * item.quantity;
                    total += cost;
                    items.push({
                        description: `Obat: ${item.medicine.name}`,
                        amount: item.medicine.price,
                        quantity: item.quantity
                    });
                });
            });
        }

        // 4. Lab/Rad Service Orders
        if (record.service_orders?.length > 0) {
            record.service_orders.forEach(order => {
                const cost = order.type === 'LAB' ? 150000 : 200000; // Mock prices
                total += cost;
                items.push({
                    description: `Layanan Penunjang: ${order.type}`,
                    amount: cost,
                    quantity: 1
                });
            });
        }

        const invoice = await prisma.invoice.create({
            data: {
                patient_id: record.patient_id,
                medical_record_id: record.id,
                total_amount: total,
                status: 'PENDING',
                items: {
                    create: items
                }
            },
            include: { items: true, patient: true }
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
