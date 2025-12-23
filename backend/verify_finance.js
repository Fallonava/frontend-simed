const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- VERIFYING FINANCE ANALYTICS LOGIC ---');
    try {
        // 1. Setup Data
        console.log('Setting up Test Data...');
        const patient = await prisma.patient.findFirst() || await prisma.patient.create({ data: { name: 'Finance Test', nik: `${Date.now()}`, no_rm: `RM-F-${Date.now()}`, birth_date: new Date(), gender: 'L' } });
        let poli = await prisma.poliklinik.findFirst();
        if (!poli) poli = await prisma.poliklinik.create({ data: { name: 'Gen', queue_code: 'G' } });
        const doctor = await prisma.doctor.findFirst() || await prisma.doctor.create({ data: { name: 'Dr Finance', specialist: 'Gen', poliklinik_id: poli.id } });

        const medicalRecord = await prisma.medicalRecord.create({
            data: {
                patient_id: patient.id,
                doctor_id: doctor.id,
                subjective: 'Finance Logic Test',
                objective: 'Financial Check',
                assessment: 'Healthy Finance',
                plan: 'Verify'
            }
        });

        // Create Transaction (Revenue Source)
        const invoiceNo = `INV-LOGIC-${Date.now()}`;
        const revenueAmount = 750000;
        await prisma.transaction.create({
            data: {
                invoice_no: invoiceNo,
                medical_record_id: medicalRecord.id,
                patient_id: patient.id,
                total_amount: revenueAmount,
                status: 'PAID',
                items: {
                    create: [
                        { description: 'Service', amount: 750000, quantity: 1 }
                    ]
                }
            }
        });
        console.log(`Created PAID Transaction: ${revenueAmount}`);

        // Create Prescription (COGS Source)
        const med = await prisma.medicine.create({
            data: { name: `MedFin-${Date.now()}`, code: `MF-${Date.now()}`, price: 10000, stock: 100, unit: 'Tablets' }
        });

        const prescription = await prisma.prescription.create({
            data: {
                medical_record_id: medicalRecord.id,
                doctor_id: doctor.id,
                patient_id: patient.id,
                status: 'COMPLETED',
                items: {
                    create: [{
                        medicine_id: med.id,
                        quantity: 5,
                        dosage: '1x1',
                        actual_price: 5000 // Cost basis
                    }]
                }
            }
        });
        const cogsAmount = 5 * 5000; // 25000
        console.log(`Created COMPLETED Prescription Items. Expected COGS addition: ${cogsAmount}`);


        // 2. Execute Aggregation Logic (Same as Controller)
        console.log('\nRunning Aggregation Queries...');

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Revenue
        const revenueAgg = await prisma.transaction.aggregate({
            _sum: { total_amount: true },
            where: {
                status: 'PAID',
                created_at: { gte: sevenDaysAgo }
            }
        });
        const totalRevenue = revenueAgg._sum.total_amount || 0;

        // COGS
        const cogsAgg = await prisma.prescriptionItem.findMany({
            where: {
                prescription: {
                    status: 'COMPLETED',
                    updated_at: { gte: sevenDaysAgo }
                }
            },
            select: { quantity: true, actual_price: true }
        });
        const totalCogs = cogsAgg.reduce((acc, item) => acc + (item.quantity * (item.actual_price || 0)), 0);

        console.log(`\nAggregated Last 7 Days:`);
        console.log(`Revenue: ${totalRevenue}`);
        console.log(`COGS:    ${totalCogs}`);

        if (totalRevenue >= revenueAmount && totalCogs >= cogsAmount) {
            console.log('\n✅ SUCCESS: Aggregation Logic correctly includes new data.');
        } else {
            console.log('\n❌ FAILURE: Data mismatch.');
        }

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
