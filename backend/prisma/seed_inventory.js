const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Inventory Data...');

    // 1. Create Suppliers
    const supplierA = await prisma.supplier.create({
        data: {
            name: 'PT. Kimia Farma Trading',
            contact: 'Budi Santoso',
            address: 'Jl. Industri No. 1, Jakarta',
            email: 'sales@kimiafarma.co.id'
        }
    });

    const supplierB = await prisma.supplier.create({
        data: {
            name: 'PT. Biofarma Persero',
            contact: 'Siti Aminah',
            address: 'Jl. Pasteur No. 28, Bandung',
            email: 'sales@biofarma.co.id'
        }
    });

    console.log('✅ Suppliers created');

    // 2. Create Locations
    const mainWarehouse = await prisma.inventoryLocation.create({
        data: { name: 'Gudang Farmasi Utama', type: 'WAREHOUSE' }
    });

    const apotekRJ = await prisma.inventoryLocation.create({
        data: { name: 'Depo Apotek Rawat Jalan', type: 'DEPOT' }
    });

    const apotekIGD = await prisma.inventoryLocation.create({
        data: { name: 'Depo IGD (Emergency)', type: 'DEPOT' }
    });

    console.log('✅ Locations created');

    // 3. Create Initial Stock in Warehouse (Batches)
    const expiry2026 = new Date();
    expiry2026.setFullYear(expiry2026.getFullYear() + 1);

    await prisma.stockBatch.createMany({
        data: [
            {
                location_id: mainWarehouse.id,
                item_name: 'Paracetamol 500mg',
                batch_no: 'BATCH-001',
                sku: 'MED-001',
                expiry_date: expiry2026,
                quantity: 5000,
                unit_cost: 200
            },
            {
                location_id: mainWarehouse.id,
                item_name: 'Amoxicillin 500mg',
                batch_no: 'BATCH-002',
                sku: 'MED-002',
                expiry_date: expiry2026,
                quantity: 2000,
                unit_cost: 500
            },
            {
                location_id: mainWarehouse.id,
                item_name: 'Infus RL (Ringer Lactate)',
                batch_no: 'BATCH-INF-01',
                sku: 'ALKES-001',
                expiry_date: expiry2026,
                quantity: 1000,
                unit_cost: 15000
            }
        ]
    });

    // 4. Create Stock in Depots (Transferred previously)
    await prisma.stockBatch.create({
        data: {
            location_id: apotekRJ.id,
            item_name: 'Paracetamol 500mg',
            batch_no: 'BATCH-001', // Same batch
            sku: 'MED-001',
            expiry_date: expiry2026,
            quantity: 500, // Smaller qty
            unit_cost: 200
        }
    });

    console.log('✅ Stock Batches created');

    // 5. Create a Purchase Order (Pending)
    await prisma.purchaseOrder.create({
        data: {
            supplier_id: supplierA.id,
            po_number: 'PO-2024-001',
            status: 'ORDERED',
            total_cost: 1000000,
            items: {
                create: [
                    { item_name: 'Vitamin C 500mg', quantity: 1000, unit_cost: 100 },
                    { item_name: 'Masker Medis (Box)', quantity: 50, unit_cost: 25000 }
                ]
            }
        }
    });

    console.log('✅ Dummy PO created');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
