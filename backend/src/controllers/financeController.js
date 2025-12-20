const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Get Financial Report (P&L)
exports.getFinancialReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        // Default to current month if not specified
        const now = new Date();
        const start = start_date ? new Date(start_date) : new Date(now.getFullYear(), now.getMonth(), 1);
        const end = end_date ? new Date(end_date) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Revenue (Paid Transactions)
        const revenueAgg = await prisma.transaction.aggregate({
            _sum: { total_amount: true },
            where: {
                status: 'PAID',
                created_at: { gte: start, lte: end }
            }
        });
        const revenue = revenueAgg._sum.total_amount || 0;

        // COGS (Prescription Items Cost)
        // For simplicity, we sum actual_price * quantity of completed prescriptions in period
        const cogsItems = await prisma.prescriptionItem.findMany({
            where: {
                prescription: {
                    status: 'COMPLETED',
                    updated_at: { gte: start, lte: end }
                }
            }
        });
        const cogs = cogsItems.reduce((sum, item) => sum + (item.quantity * (item.actual_price || 0)), 0);

        // Expenses (Operational)
        const expenses = await prisma.expense.findMany({
            where: {
                date: { gte: start, lte: end }
            }
        });
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Expense Breakdown
        const expenseByCategory = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

        // Net Profit
        const grossProfit = revenue - cogs;
        const netProfit = grossProfit - totalExpenses;
        const margin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0;

        res.json({
            period: { start, end },
            summary: {
                revenue,
                cogs,
                grossProfit,
                expenses: totalExpenses,
                netProfit,
                margin
            },
            expenseBreakdown: expenseByCategory,
            details: {
                expenses: expenses.sort((a, b) => new Date(b.date) - new Date(a.date))
            }
        });

    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

// 2. Create Expense
exports.createExpense = async (req, res) => {
    try {
        const { description, amount, category, date } = req.body;
        const expense = await prisma.expense.create({
            data: {
                description,
                amount: parseFloat(amount),
                category,
                date: date ? new Date(date) : new Date()
            }
        });
        res.json({ success: true, data: expense });
    } catch (error) {
        res.status(500).json({ error: 'Failed to record expense' });
    }
};

// 3. Get Expenses List
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
            take: 100
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};

// Legacy Analytics (Redirection)
exports.getAnalytics = async (req, res) => {
    return exports.getFinancialReport(req, res);
};

// 4. Create Invoice
exports.createInvoice = async (req, res) => {
    const { patientId, amount, description } = req.body;
    try {
        const invoice = await prisma.invoice.create({
            data: {
                patient_id: parseInt(patientId),
                total_amount: parseFloat(amount),
                status: 'PENDING',
                created_at: new Date()
            }
        });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create invoice' });
    }
};

// 5. Get Unpaid Invoices
exports.getUnpaidInvoices = async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            where: { status: 'PENDING' },
            include: { patient: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get invoices' });
    }
};

// 6. Pay Invoice
exports.payInvoice = async (req, res) => {
    const { id } = req.params;
    try {
        const invoice = await prisma.invoice.update({
            where: { id: parseInt(id) },
            data: { status: 'PAID', paid_at: new Date() }
        });
        if (invoice.transaction_id) {
            await prisma.transaction.update({
                where: { id: invoice.transaction_id },
                data: { status: 'PAID' }
            });
        }
        res.json({ status: 'success', invoice });
    } catch (error) {
        res.status(500).json({ error: 'Payment failed' });
    }
};

// 7. Get Billable Visits
exports.getBillableVisits = async (req, res) => {
    try {
        const billables = await prisma.medicalRecord.findMany({
            take: 20,
            include: { patient: true }
        });
        res.json(billables);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch billables' });
    }
};

// 8. Daily Report
exports.getDailyReport = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const invoices = await prisma.invoice.findMany({
            where: {
                created_at: { gte: today }
            }
        });

        const total = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
        res.json({ date: today, count: invoices.length, total });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};
