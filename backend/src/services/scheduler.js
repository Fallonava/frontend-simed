const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkReorderLevels = async (io) => {
    console.log('🔄 Scheduler: Checking Stock Levels...');

    try {
        // 1. Get Medicines with low stock (Phase 1 'stock' field + Phase 2 'StockBatch' sum)
        // For accurate Phase 2, we should sum StockBatches per item_name

        // Let's iterate medicines and check their StockBatch total
        const medicines = await prisma.medicine.findMany();

        for (const med of medicines) {
            // Calculate Total Stock across all Locations (Warehouses + Depots)
            // Note: In real world, we might only check Warehouse stock for reordering

            const batches = await prisma.stockBatch.findMany({
                where: { item_name: med.name }
            });

            const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);

            if (totalStock <= med.min_stock) {
                console.log(`⚠️ Low Stock Alert: ${med.name} (Qty: ${totalStock}, Min: ${med.min_stock})`);

                // Check if there's already a PENDING/DRAFT PO for this item
                // Complex in this schema as PO items are nested.
                // For MVP: Just create a Draft PO if no open PO exists for this Supplier today.

                // Find Supplier (Mock: Pick first or specific)
                const supplier = await prisma.supplier.findFirst();
                if (!supplier) continue;

                // Create Auto PO
                const poNumber = `AUTO-PO-${Date.now()}`;

                await prisma.purchaseOrder.create({
                    data: {
                        supplier_id: supplier.id,
                        po_number: poNumber,
                        status: 'DRAFT',
                        total_cost: med.reorder_qty * 100, // Estimate
                        items: {
                            create: {
                                item_name: med.name,
                                quantity: med.reorder_qty,
                                unit_cost: 100 // Placeholder cost
                            }
                        }
                    }
                });

                console.log(`✅ Auto-PO Created: ${poNumber}`);
                if (io) io.emit('inventory_alert', { message: `Low Stock: ${med.name}. Auto-PO Created.` });
            }
        }

    } catch (error) {
        console.error('Scheduler Error:', error);
    }
};

const initScheduler = (io) => {
    // Run every 60 seconds for demo purposes (Real world: Daily)
    setInterval(() => {
        checkReorderLevels(io);
    }, 60000);

    // Run immediately on startup
    checkReorderLevels(io);
};

module.exports = initScheduler;
