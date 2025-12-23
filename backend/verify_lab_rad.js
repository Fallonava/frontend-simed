const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- VERIFYING LAB & RADIOLOGY ---');
    try {
        // 1. Setup Data
        const patient = await prisma.patient.findFirst() || await prisma.patient.create({ data: { name: 'Test Patient', no_rm: 'RM-TEST', birth_date: new Date() } });
        const doctor = await prisma.doctor.findFirst() || await prisma.doctor.create({ data: { name: 'Dr. Test' } });
        const record = await prisma.medicalRecord.create({
            data: {
                patient_id: patient.id,
                doctor_id: doctor.id,
                // SOAP (Required)
                subjective: 'Test Subjective',
                objective: 'Test Objective',
                assessment: 'Test Diagnosis',
                plan: 'Test Plan',
                created_at: new Date()
            }
        });

        // 2. Create Orders
        console.log('1. Creating Service Orders...');
        const labOrder = await prisma.serviceOrder.create({
            data: {
                medical_record_id: record.id,
                type: 'LAB',
                notes: 'Cek Darah Lengkap',
                status: 'ORDERED'
            }
        });
        console.log('   Lab Order Created:', labOrder.id);

        const radOrder = await prisma.serviceOrder.create({
            data: {
                medical_record_id: record.id,
                type: 'RAD',
                notes: 'X-Ray Thorax',
                status: 'ORDERED'
            }
        });
        console.log('   Rad Order Created:', radOrder.id);

        // 3. Fetch Pending (Simulating Dashboard)
        const pendingLab = await prisma.serviceOrder.findMany({ where: { type: 'LAB', status: 'ORDERED' } });
        if (pendingLab.some(o => o.id === labOrder.id)) console.log('   ✅ Lab Order visible in Dashboard');
        else console.error('   ❌ Lab Order NOT visible');

        // 4. Submit Results
        console.log('2. Submitting Results...');

        // Lab Result
        const labResultPayload = { hb: 12, leukocytes: 5000 };
        await prisma.serviceOrder.update({
            where: { id: labOrder.id },
            data: { status: 'COMPLETED', result: JSON.stringify(labResultPayload) }
        });
        console.log('   Lab Result Submitted.');

        // Rad Result
        const radResultPayload = "https://mock-url.com/xray.jpg";
        await prisma.serviceOrder.update({
            where: { id: radOrder.id },
            data: { status: 'COMPLETED', result: radResultPayload }
        });
        console.log('   Rad Result Submitted.');

        // 5. Verify Completed
        const finalLab = await prisma.serviceOrder.findUnique({ where: { id: labOrder.id } });
        const finalRad = await prisma.serviceOrder.findUnique({ where: { id: radOrder.id } });

        if (finalLab.status === 'COMPLETED' && finalLab.result.includes('hb')) {
            console.log('   ✅ Lab Flow Verified: Completed with Result');
        } else {
            console.error('   ❌ Lab Verification Failed');
        }

        if (finalRad.status === 'COMPLETED' && finalRad.result === radResultPayload) {
            console.log('   ✅ Rad Flow Verified: Completed with Image URL');
        } else {
            console.error('   ❌ Rad Verification Failed');
        }

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
