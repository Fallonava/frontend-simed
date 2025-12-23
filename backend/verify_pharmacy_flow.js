const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING PHARMACY FLOW VERIFICATION ---');

    try {
        // 1. Setup Data: Create a Medicine and Inventory Location
        console.log('\n[1] Setting up Test Data...');

        let location = await prisma.inventoryLocation.findFirst({ where: { name: 'Depo Apotek Rawat Jalan' } });
        if (!location) {
            location = await prisma.inventoryLocation.create({
                data: { name: 'Depo Apotek Rawat Jalan', type: 'DAIJ', description: 'Main Outpatient Pharmacy' }
            });
            console.log('Created Location: Depo Apotek Rawat Jalan');
        }

        const testMedName = `TestMed_${Date.now()}`;
        const medicine = await prisma.medicine.create({
            data: {
                name: testMedName,
                code: `TM-${Date.now()}`,
                stock: 100, // Master Stock
                price: 5000,
                category: 'Drug',
                unit: 'tablets'
            }
        });
        console.log(`Created Medicine: ${medicine.name} (Stock: ${medicine.stock})`);

        // Create Stock Batch
        // FIXED: Removed invalid key 'batch_number'
        await prisma.stockBatch.create({
            data: {
                location_id: location.id,
                item_name: medicine.name,
                batch_no: `BATCH-${Date.now()}`,
                quantity: 50,
                unit_cost: 2500,
                expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            }
        });
        console.log(`Created Stock Batch: 50 units @ 2500`);

        // 2. Prerequisites
        console.log('\n[2] Checking Prerequisites...');
        let doctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
        if (!doctor) {
            let poli = await prisma.poliklinik.findFirst();
            if (!poli) poli = await prisma.poliklinik.create({ data: { name: 'General', queue_code: 'A' } });

            // Just create doctor entity if needed, user role checks might vary
            // Here we assume we just need a Doctor ID
            const d = await prisma.doctor.create({
                data: { name: 'Dr. Test', specialist: 'General', poliklinik_id: poli.id }
            });
            doctor = d; // Use this as doctor object
        } else {
            const d = await prisma.doctor.findFirst();
            if (d) doctor = d;
            else {
                let poli = await prisma.poliklinik.findFirst();
                if (!poli) poli = await prisma.poliklinik.create({ data: { name: 'General', queue_code: 'A' } });
                doctor = await prisma.doctor.create({
                    data: { name: 'Dr. Test', specialist: 'General', poliklinik_id: poli.id }
                });
            }
        }

        let patient = await prisma.patient.findFirst();
        if (!patient) {
            patient = await prisma.patient.create({
                data: { name: 'Test Patient', no_rm: `RM-${Date.now()}`, nik: `${Date.now()}`, birth_date: new Date(), gender: 'L' }
            });
        }

        let record = await prisma.medicalRecord.findFirst();
        if (!record) {
            record = await prisma.medicalRecord.create({
                data: {
                    patient_id: patient.id,
                    doctor_id: doctor.id,
                    subjective: 'Test',
                    objective: 'Test',
                    assessment: 'Test',
                    plan: 'Test'
                }
            });
        }

        // 3. Create Prescription
        console.log('\n[3] Creating Prescription...');
        const prescription = await prisma.prescription.create({
            data: {
                medical_record_id: record.id,
                doctor_id: doctor.id,
                patient_id: patient.id,
                status: 'PENDING',
                notes: 'Test Prescription',
                items: {
                    create: [{
                        medicine_id: medicine.id,
                        quantity: 10,
                        dosage: '1x1',
                        notes: 'After meal'
                    }]
                }
            },
            include: { items: true }
        });
        console.log(`Prescription Created: ID ${prescription.id} for 10 units.`);

        // 4. Process
        console.log('\n[4] Processing Prescription (PENDING -> COMPLETED)...');
        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.prescription.update({
                where: { id: prescription.id },
                data: { status: 'COMPLETED' },
                include: { items: { include: { medicine: true } } }
            });

            if (updated.status === 'COMPLETED') {
                const loc = await tx.inventoryLocation.findFirst({ where: { name: 'Depo Apotek Rawat Jalan' } });

                for (const item of updated.items) {
                    let qtyToDeduct = item.quantity;
                    const batches = await tx.stockBatch.findMany({
                        where: { location_id: loc.id, item_name: item.medicine.name, quantity: { gt: 0 } },
                        orderBy: { expiry_date: 'asc' }
                    });

                    for (const batch of batches) {
                        if (qtyToDeduct <= 0) break;
                        const deduct = Math.min(batch.quantity, qtyToDeduct);
                        await tx.stockBatch.update({
                            where: { id: batch.id },
                            data: { quantity: { decrement: deduct } }
                        });
                        qtyToDeduct -= deduct;
                        console.log(`   -> Deducted ${deduct} from Batch ${batch.batch_no}`);
                    }

                    await tx.medicine.update({
                        where: { id: item.medicine_id },
                        data: { stock: { decrement: item.quantity } }
                    });
                }
            }
            return updated;
        });

        // 5. Verify
        console.log('\n[5] Verifying Inventory...');
        const updatedMed = await prisma.medicine.findUnique({ where: { id: medicine.id } });
        const updatedBatch = await prisma.stockBatch.findFirst({ where: { item_name: medicine.name } });

        console.log(`Master Stock: ${medicine.stock} -> ${updatedMed.stock}`);
        // Batch stock might be finding old batches if names collide, but name is unique timestamped.
        console.log(`Batch Stock:  50 -> ${updatedBatch.quantity}`);

        if (updatedMed.stock === 90 && updatedBatch.quantity === 40) {
            console.log('\n✅ SUCCESS: Stock deducted correctly from both Master and Batch!');
        } else {
            console.log('\n❌ FAILURE: Stock mismatch.');
        }

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
