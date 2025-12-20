const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- VERIFYING MEDICAL RECORDS RICH DATA ---');
    try {
        // 1. Setup Patient & Doctor
        console.log('1. Setting up Test Data...');
        const patient = await prisma.patient.findFirst();
        const doctor = await prisma.doctor.findFirst();

        // 2. Create Medical Record
        const record = await prisma.medicalRecord.create({
            data: {
                patient_id: patient.id,
                doctor_id: doctor.id,
                visit_date: new Date(),
                subjective: 'Sakit Kepala',
                objective: 'BP 120/80',
                assessment: 'Cephalgia',
                plan: 'Istirahat'
            }
        });
        console.log(`   Medical Record Created: ID ${record.id}`);

        // 3. Add Prescription
        const medicine = await prisma.medicine.findFirst() || await prisma.medicine.create({ data: { name: 'Paracetamol', code: 'PCT', price: 500 } });
        await prisma.prescription.create({
            data: {
                medical_record_id: record.id,
                doctor_id: doctor.id,
                patient_id: patient.id,
                status: 'COMPLETED',
                items: {
                    create: [{ medicine_id: medicine.id, quantity: 10, dosage: '3x1' }]
                }
            }
        });
        console.log('   Prescription Added.');

        // 4. Add Service Order
        await prisma.serviceOrder.create({
            data: {
                medical_record_id: record.id,
                type: 'LAB',
                notes: 'Cek Darah Lengkap',
                status: 'COMPLETED'
            }
        });
        console.log('   Service Order Added.');

        // 5. Verify Fetch (Simulate getAll / getHistory)
        console.log('5. Fetching Record with Relations...');
        const fetchedRecord = await prisma.medicalRecord.findUnique({
            where: { id: record.id },
            include: {
                prescriptions: { include: { items: { include: { medicine: true } } } },
                service_orders: true
            }
        });

        if (fetchedRecord.prescriptions.length > 0 && fetchedRecord.service_orders.length > 0) {
            console.log(`   ✅ Verified: Found ${fetchedRecord.prescriptions.length} Prescriptions`);
            console.log(`   ✅ Verified: Found ${fetchedRecord.service_orders.length} Service Orders`);
            console.log('   Structure check passed.');
        } else {
            console.error('   ❌ FAILED: Relations missing.');
        }

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
