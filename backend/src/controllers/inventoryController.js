const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Stock Overview (Filtered by Location)
exports.getStock = async (req, res) => {
    try {
        const { location_id } = req.query;
        const where = location_id ? { location_id: parseInt(location_id) } : {};

        const stocks = await prisma.stockBatch.findMany({
            where,
            include: {
                location: true,
            },
            orderBy: {
                expiry_date: 'asc' // FIFO logic (FE can highlight Expired)
            }
        });
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Low Stock Alerts
exports.getLowStock = async (req, res) => {
    try {
        const stocks = await prisma.stockBatch.findMany({
            where: {
                quantity: {
                    lte: 10 // Threshold for low stock
                }
            },
            include: {
                location: true
            }
        });
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create Purchase Order (Draft)
exports.createPO = async (req, res) => {
    try {
        const { supplier_id, items } = req.body; // items = [{name, qty, cost}]

        // Generate PO Number
        const count = await prisma.purchaseOrder.count();
        const po_number = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

        const po = await prisma.purchaseOrder.create({
            data: {
                supplier_id: parseInt(supplier_id),
                po_number,
                status: 'DRAFT',
                items: {
                    create: items.map(item => ({
                        item_name: item.name,
                        quantity: parseInt(item.qty),
                        unit_cost: parseFloat(item.cost),
                        received_qty: 0
                    }))
                },
                total_cost: items.reduce((acc, item) => acc + (item.qty * item.cost), 0)
            },
            include: { items: true }
        });

        res.json(po);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Pending POs (Draft/Ordered)
exports.getPendingPOs = async (req, res) => {
    try {
        const pos = await prisma.purchaseOrder.findMany({
            where: {
                status: {
                    in: ['DRAFT', 'ORDERED']
                }
            },
            include: {
                supplier: true,
                items: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        res.json(pos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Receive Goods (PO -> Stock)
exports.receiveGoods = async (req, res) => {
    try {
        const { po_id, location_id } = req.body; // Default location = 1 (Main Warehouse)

        // 1. Get PO
        const po = await prisma.purchaseOrder.findUnique({
            where: { id: parseInt(po_id) },
            include: { items: true }
        });

        if (!po || po.status === 'RECEIVED') {
            return res.status(400).json({ error: 'Invalid PO or already received' });
        }

        // 2. Add to StockBatch
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 2); // Default 2 years expiry if not specified

        for (const item of po.items) {
            await prisma.stockBatch.create({
                data: {
                    location_id: parseInt(location_id),
                    item_name: item.item_name,
                    quantity: item.quantity,
                    unit_cost: item.unit_cost,
                    expiry_date: expiryDate,
                    batch_no: `BATCH-${po.po_number}`
                }
            });
        }

        // 3. Update PO Status
        const updatedPO = await prisma.purchaseOrder.update({
            where: { id: parseInt(po_id) },
            data: {
                status: 'RECEIVED',
                received_at: new Date()
            }
        });

        res.json({ message: 'Goods Received into Stock', po: updatedPO });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Transfer Stock (Warehouse -> Depot)
exports.transferStock = async (req, res) => {
    try {
        const { from_loc_id, to_loc_id, item_name, quantity, user_name } = req.body;

        // 1. Find Source Batch (FIFO - Pick earliest expiry)
        const sourceBatch = await prisma.stockBatch.findFirst({
            where: {
                location_id: parseInt(from_loc_id),
                item_name: item_name,
                quantity: { gte: parseInt(quantity) }
            },
            orderBy: { expiry_date: 'asc' }
        });

        if (!sourceBatch) {
            return res.status(400).json({ error: 'Insufficient stock in source location' });
        }

        // 2. Create Transfer Record
        const transfer = await prisma.stockTransfer.create({
            data: {
                from_loc_id: parseInt(from_loc_id),
                to_loc_id: parseInt(to_loc_id),
                status: 'COMPLETED', // Auto-approve for now
                requested_by: user_name || 'System',
                items: {
                    create: {
                        item_name,
                        quantity: parseInt(quantity),
                        stock_batch_id: sourceBatch.id
                    }
                }
            }
        });

        // 3. Move Stock (Decrement Source, Increment Destination)
        await prisma.stockBatch.update({
            where: { id: sourceBatch.id },
            data: { quantity: sourceBatch.quantity - parseInt(quantity) }
        });

        // Check if destination has same batch/item
        const destBatch = await prisma.stockBatch.findFirst({
            where: {
                location_id: parseInt(to_loc_id),
                item_name: item_name,
                batch_no: sourceBatch.batch_no
            }
        });

        if (destBatch) {
            await prisma.stockBatch.update({
                where: { id: destBatch.id },
                data: { quantity: destBatch.quantity + parseInt(quantity) }
            });
        } else {
            await prisma.stockBatch.create({
                data: {
                    location_id: parseInt(to_loc_id),
                    item_name: item_name,
                    quantity: parseInt(quantity),
                    batch_no: sourceBatch.batch_no,
                    expiry_date: sourceBatch.expiry_date,
                    unit_cost: sourceBatch.unit_cost
                }
            });
        }

        res.json({ message: 'Transfer Successful', transfer });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
