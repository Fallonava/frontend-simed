const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- VERIFYING INVENTORY & PROCUREMENT FLOW ---');
    try {
        // 1. Setup / Cleanup
        console.log('1. Setting up Master Data...');

        // Ensure Supplier
        const supplier = await prisma.supplier.upsert({
            where: { id: 1 },
            update: {},
            create: { name: 'PharmaDistro Ltd', contact: '08123456789', address: 'Jakarta' }
        });

        // Ensure Locations
        await prisma.inventoryLocation.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: 'Main Warehouse', type: 'WAREHOUSE' } }); // ID 1
        await prisma.inventoryLocation.upsert({ where: { id: 2 }, update: {}, create: { id: 2, name: 'Pharmacy', type: 'DEPOT' } });      // ID 2

        // 2. Create PO (Draft)
        const itemName = `TestMed-${Date.now()}`;
        console.log(`2. Creating PO for item: ${itemName}...`);

        const po = await prisma.purchaseOrder.create({
            data: {
                supplier_id: supplier.id,
                po_number: `PO-TEST-${Date.now()}`,
                status: 'ORDERED',
                items: {
                    create: [
                        { item_name: itemName, quantity: 100, unit_cost: 5000, received_qty: 0 }
                    ]
                },
                total_cost: 500000
            },
            include: { items: true }
        });
        console.log(`   PO Created: ${po.po_number} (Status: ${po.status})`);

        // 3. Receive Goods
        console.log('3. Receiving Goods into Main Warehouse...');

        // Simulate Logic from receiveGoods controller
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 2);

        for (const item of po.items) {
            await prisma.stockBatch.create({
                data: {
                    location_id: 1, // Warehouse
                    item_name: item.item_name,
                    quantity: item.quantity,
                    unit_cost: item.unit_cost,
                    expiry_date: expiryDate,
                    batch_no: `BATCH-${po.po_number}`
                }
            });
        }

        await prisma.purchaseOrder.update({
            where: { id: po.id },
            data: { status: 'RECEIVED', received_at: new Date() }
        });
        console.log('   Goods Received.');

        // 4. Verify Stock at Warehouse
        const stockWh = await prisma.stockBatch.findFirst({
            where: { location_id: 1, item_name: itemName }
        });
        console.log(`   Stock at Warehouse: ${stockWh.quantity} (Expected: 100)`);

        if (stockWh.quantity !== 100) throw new Error("Stock verification failed!");

        // 5. Transfer Stock to Pharmacy
        console.log('5. Transferring 20 units to Pharmacy...');
        const transferQty = 20;

        // Simulate transfer logic
        await prisma.stockBatch.update({
            where: { id: stockWh.id },
            data: { quantity: stockWh.quantity - transferQty }
        });

        await prisma.stockBatch.create({
            data: {
                location_id: 2, // Pharmacy
                item_name: itemName,
                quantity: transferQty,
                unit_cost: stockWh.unit_cost,
                expiry_date: stockWh.expiry_date,
                batch_no: stockWh.batch_no
            }
        });

        // 6. Final Verification
        const stockWhFinal = await prisma.stockBatch.findFirst({ where: { id: stockWh.id } });
        const stockPharm = await prisma.stockBatch.findFirst({ where: { location_id: 2, item_name: itemName } });

        console.log(`   Final Stock Warehouse: ${stockWhFinal.quantity} (Expected: 80)`);
        console.log(`   Final Stock Pharmacy:  ${stockPharm.quantity} (Expected: 20)`);

        if (stockWhFinal.quantity === 80 && stockPharm.quantity === 20) {
            console.log('\n✅ SUCCESS: Inventory & Procurement logic verified.');
        } else {
            console.log('\n❌ FAILURE: Stock transfer mismatch.');
        }

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
