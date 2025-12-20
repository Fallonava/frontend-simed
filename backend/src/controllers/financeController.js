const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAnalytics = async (req, res) => {
    try {
        const { range } = req.query; // e.g. '7days'

        // 1. Calculate Total Revenue (All Paid Transactions)
        // Ideally filter by date range, but for now we take all for the summary card or last 30 days
        const revenueAgg = await prisma.transaction.aggregate({
            _sum: { total_amount: true },
            where: { status: 'PAID' }
        });
        const totalRevenue = revenueAgg._sum.total_amount || 0;

        // 2. Calculate COGS (Cost of Goods Sold)
        // Derived from PrescriptionItems (Medicines) + InvoiceItems (maybe Services cost? usually 0 for services)
        // We focus on Medicine COGS for now as it's the main variable cost
        // We sum (quantity * actual_price) from PrescriptionItems where status is COMPLETED
        // linking via Prescription -> status COMPLETED
        // OR PrescriptionItem where prescription.status = 'COMPLETED'

        // Note: PrescriptionItem has actual_price (unit cost snapshot)
        const cogsAgg = await prisma.prescriptionItem.findMany({
            where: {
                prescription: { status: 'COMPLETED' }
            },
            select: {
                quantity: true,
                actual_price: true
            }
        });

        const totalCogs = cogsAgg.reduce((acc, item) => {
            return acc + (item.quantity * (item.actual_price || 0));
        }, 0);

        const grossProfit = totalRevenue - totalCogs;
        const margin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0;


        // 3. Chart Data (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const transactions = await prisma.transaction.findMany({
            where: {
                created_at: { gte: sevenDaysAgo },
                status: 'PAID'
            },
            orderBy: { created_at: 'asc' }
        });

        // Group by Day
        const chartMap = {};
        // Initialize last 7 days keys
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            // Format: "Mon", "Tue" etc is hard to sort charts.
            // component uses "name". Let's use YYYY-MM-DD for key and format later, or Day Name
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon"
            if (!chartMap[dayName]) chartMap[dayName] = { name: dayName, Revenue: 0, Cost: 0 };
        }

        // Fill Revenue
        transactions.forEach(t => {
            const dayName = new Date(t.created_at).toLocaleDateString('en-US', { weekday: 'short' });
            if (chartMap[dayName]) {
                chartMap[dayName].Revenue += t.total_amount;
            }
        });

        // Fill COGS (Daily) - Re-query prescriptions for this week
        const weeklyPrescriptions = await prisma.prescriptionItem.findMany({
            where: {
                prescription: {
                    status: 'COMPLETED',
                    updated_at: { gte: sevenDaysAgo }
                }
            },
            include: { prescription: true }
        });

        weeklyPrescriptions.forEach(item => {
            const dayName = new Date(item.prescription.updated_at).toLocaleDateString('en-US', { weekday: 'short' });
            if (chartMap[dayName]) {
                chartMap[dayName].Cost += (item.quantity * (item.actual_price || 0));
            }
        });

        // Convert Map to Array (Sort by date usually needed, but map keys iteration order is insertion-ish. 
        // Simplest: Just array reverse if we built backwards, or relying on set keys)
        // Let's ensure order: Today is last.
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            if (chartMap[dayName]) chartData.push(chartMap[dayName]);
            else chartData.push({ name: dayName, Revenue: 0, Cost: 0 });
        }


        // 4. Top Products (Profitability)
        // Group PrescriptionItems by medicine_id
        const productStats = {}; // { medName: { revenue: 0, cost: 0, sold: 0 } }

        // Need Revenue for specific items. InvoiceItem usually has this.
        // Assuming InvoiceItem links to Medicine or Description
        // Let's use InvoiceItem for Revenue breakdown if possible? 
        // InvoiceItem has `description` and `amount` (total price for that item line?).
        // Linking InvoiceItem to Medicine is via name string currently or ID if we added it?
        // Schema: purchaseOrderItem has med_id. InvoiceItem does NOT have medicine_id explicit in schema shown?
        // Wait, schema Step 169: InvoiceItem just string description.
        // PrescriptionItem has price? No, PrescriptionItem in DB doesn't have selling price, only `actual_price` (cost).
        // The selling price is in `Medicine.price`.
        // So Revenue = Qty * Medicine.price (Current price? or snapshot?)
        // Ideally Snapshot. But for analytics now, let's use `Medicine.price` * `Qty`.

        // We iterate `weeklyPrescriptions` again or all time?
        // "Top Products" usually implies meaningful time window or all time. Let's do All Time for simplicity or Limit to 1000 items.
        // Let's take the Top 500 prescription items to aggregate.

        const recentItems = await prisma.prescriptionItem.findMany({
            take: 500,
            where: { prescription: { status: 'COMPLETED' } },
            include: { medicine: true }
        });

        recentItems.forEach(item => {
            const name = item.medicine.name;
            const cost = item.quantity * (item.actual_price || 0);
            // Revenue estimate: Qty * Current Med Price (since we don't store snapshot of sell price on item yet)
            const rev = item.quantity * item.medicine.price;

            if (!productStats[name]) productStats[name] = { name, revenue: 0, cost: 0 };
            productStats[name].revenue += rev;
            productStats[name].cost += cost;
        });

        const topProducts = Object.values(productStats).map(p => ({
            name: p.name,
            revenue: p.revenue,
            profit: p.revenue - p.cost,
            margin: p.revenue > 0 ? Math.round(((p.revenue - p.cost) / p.revenue) * 100) : 0
        })).sort((a, b) => b.profit - a.profit).slice(0, 5);


        res.json({
            stats: {
                revenue: totalRevenue,
                cogs: totalCogs,
                grossProfit,
                margin
            },
            chartData,
            topProducts
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};
// 5. Create Invoice (Manual or specific logic)
exports.createInvoice = async (req, res) => {
    // Basic implementation to satisfy route
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

// 6. Get Unpaid Invoices
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

// 7. Pay Invoice
exports.payInvoice = async (req, res) => {
    const { id } = req.params;
    try {
        const invoice = await prisma.invoice.update({
            where: { id: parseInt(id) },
            data: { status: 'PAID', paid_at: new Date() }
        });
        // Also update linked transaction if any
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

// 8. Get Billable Visits (Visits without Invoice)
exports.getBillableVisits = async (req, res) => {
    try {
        // Mock implementation or fetch from MedicalRecord/Admission that are finished but not billed
        // For now return empty or simple query
        const billables = await prisma.medicalRecord.findMany({
            where: {
                // status: 'FINISHED' 
                // invoice: null (if relation exists)
            },
            take: 20,
            include: { patient: true }
        });
        res.json(billables);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch billables' });
    }
};

// 9. Daily Report
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
