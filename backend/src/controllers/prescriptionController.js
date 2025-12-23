const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Prescription
exports.create = async (req, res) => {
    const { medical_record_id, doctor_id, patient_id, notes, items } = req.body;

    try {
        // Validation: Check stocks
        for (const item of items) {
            const medicine = await prisma.medicine.findUnique({ where: { id: item.medicine_id } });
            if (!medicine || medicine.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${medicine?.name || 'Unknown item'}` });
            }
        }

        const prescription = await prisma.prescription.create({
            data: {
                medical_record_id: parseInt(medical_record_id),
                doctor_id: parseInt(doctor_id),
                patient_id: parseInt(patient_id),
                notes,
                items: {
                    create: items.map(item => ({
                        medicine_id: item.medicine_id,
                        quantity: item.quantity,
                        dosage: item.dosage,
                        notes: item.notes
                    }))
                }
            },
            include: { items: { include: { medicine: true } } }
        });

        // Emit Socket Event for Pharmacy Dashboard
        req.io.emit('new_prescription', prescription);

        res.status(201).json(prescription);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create prescription' });
    }
};

// Get All Prescriptions (Queue)
exports.getAll = async (req, res) => {
    const { status } = req.query;
    try {
        const where = status ? { status } : {};
        const prescriptions = await prisma.prescription.findMany({
            where,
            include: {
                patient: true,
                doctor: true,
                items: { include: { medicine: true } }
            },
            orderBy: { created_at: 'asc' }
        });
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prescriptions' });
    }
};

// Update Status (Process Prescription)
exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // PENDING -> PREPARING -> COMPLETED

    try {
        const prescriptionId = parseInt(id);

        // Transaction to deduct stock if status becomes COMPLETED
        const result = await prisma.$transaction(async (tx) => {
            const prescription = await tx.prescription.update({
                where: { id: prescriptionId },
                data: { status },
                include: { items: { include: { medicine: true } } }
            });

            if (status === 'COMPLETED') {
                // Phase 2: Deduct from Smart Inventory (FIFO)
                // 1. Get Pharmacy Location (Depo Rawat Jalan)
                const pharmacyLocation = await tx.inventoryLocation.findFirst({
                    where: { name: 'Depo Apotek Rawat Jalan' }
                });

                if (!pharmacyLocation) {
                    // Fallback/Warning: If depot not found, just deduct from legacy Master (Phase 1)
                    console.warn('Smart Inventory: Depo Apotek Rawat Jalan not found. Skipping Batch deduction.');
                } else {
                    for (const item of prescription.items) {
                        let qtyToDeduct = item.quantity;
                        const medicineName = item.medicine.name;
                        let totalCost = 0;
                        let qtyConfigured = 0;

                        // 2. Find Batches (FIFO - Earliest Expiry First)
                        const batches = await tx.stockBatch.findMany({
                            where: {
                                location_id: pharmacyLocation.id,
                                item_name: medicineName,
                                quantity: { gt: 0 }
                            },
                            orderBy: { expiry_date: 'asc' }
                        });

                        // 3. Deduct from Batches
                        for (const batch of batches) {
                            if (qtyToDeduct <= 0) break;

                            const deduct = Math.min(batch.quantity, qtyToDeduct);

                            // Cost Calculation (Phase 2: COGS)
                            const batchCost = batch.unit_cost || 0;
                            totalCost += (deduct * batchCost);
                            qtyConfigured += deduct;

                            await tx.stockBatch.update({
                                where: { id: batch.id },
                                data: { quantity: { decrement: deduct } }
                            });

                            qtyToDeduct -= deduct;
                        }

                        // 4. Save Actual Cost Snapshot (Weighted Avg)
                        if (qtyConfigured > 0) {
                            const weightedAvgCost = totalCost / qtyConfigured;
                            await tx.prescriptionItem.update({
                                where: { id: item.id },
                                data: { actual_price: weightedAvgCost }
                            });
                        }

                        // Alert if insufficient stock in batches
                        if (qtyToDeduct > 0) {
                            console.warn(`Partial fulfillment for ${medicineName}. Missing: ${qtyToDeduct}`);
                        }
                    }
                }

                // Phase 1 Legacy: Also update Master Catalog stock for backward compatibility
                for (const item of prescription.items) {
                    await tx.medicine.update({
                        where: { id: item.medicine_id },
                        data: { stock: { decrement: item.quantity } }
                    });
                }
            }
            return prescription;
        });

        req.io.emit('prescription_update', result);
        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update prescription status' });
    }
};
