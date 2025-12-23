const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkReorderLevels = async (io) => {
    console.log('🔄 Cron Job: Checking Stock Levels...');

    try {
        const medicines = await prisma.medicine.findMany();

        for (const med of medicines) {
            const batches = await prisma.stockBatch.findMany({
                where: { item_name: med.name }
            });

            const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);

            if (totalStock <= med.min_stock) {
                console.log(`⚠️ Low Stock Alert: ${med.name} (Qty: ${totalStock}, Min: ${med.min_stock})`);

                const supplier = await prisma.supplier.findFirst();
                if (!supplier) continue;

                // Simple check to avoid creating duplicate POs constantly
                // Check if any PO created today for this supplier is still DRAFT
                const existingPO = await prisma.purchaseOrder.findFirst({
                    where: {
                        supplier_id: supplier.id,
                        status: 'DRAFT',
                        created_at: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0))
                        }
                    }
                });

                if (!existingPO) {
                    const poNumber = `AUTO-PO-${Date.now()}`;
                    await prisma.purchaseOrder.create({
                        data: {
                            supplier_id: supplier.id,
                            po_number: poNumber,
                            status: 'DRAFT',
                            total_cost: med.reorder_qty * 1000,
                            items: {
                                create: {
                                    item_name: med.name,
                                    quantity: med.reorder_qty,
                                    unit_cost: 0
                                }
                            }
                        }
                    });
                    console.log(`✅ Auto-PO Created: ${poNumber}`);
                    if (io) io.emit('inventory_alert', { message: `Low Stock: ${med.name}. Auto-PO Created.` });
                }
            }
        }

    } catch (error) {
        console.error('Scheduler Error:', error);
    }
};

const initScheduler = (io) => {
    console.log('📅 Scheduler Service Initialized (Node-Cron)');

    // Schedule task to run every hour at minute 0
    // Syntax: minute hour day-of-month month day-of-week
    cron.schedule('0 * * * *', () => {
        checkReorderLevels(io);
    });

    // Also run a check 5 seconds after startup (for immediate feedback in dev)
    setTimeout(() => {
        checkReorderLevels(io);
    }, 5000);
};

module.exports = initScheduler;
