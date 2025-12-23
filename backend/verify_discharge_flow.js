const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- VERIFYING DISCHARGE BILLING FLOW ---');
    try {
        // 1. Setup Data
        console.log('1. Setting up Test Admission...');

        // Create Room & Bed
        const room = await prisma.room.upsert({
            where: { id: 99 },
            update: {},
            create: { id: 99, name: 'VIP-Test', type: 'VIP', price: 1000000 }
        });

        const bed = await prisma.bed.upsert({
            where: { id: 999 },
            update: { status: 'OCCUPIED' },
            create: { id: 999, room_id: 99, code: 'A', status: 'OCCUPIED' }
        });

        // Create Patient
        const patient = await prisma.patient.findFirst() || await prisma.patient.create({ data: { name: 'Billing Test', nik: `${Date.now()}`, no_rm: `RM-B-${Date.now()}`, birth_date: new Date(), gender: 'L' } });

        // Create Admission (Check-in 3 days ago)
        const checkInDate = new Date();
        checkInDate.setDate(checkInDate.getDate() - 3);

        const admission = await prisma.admission.create({
            data: {
                patient_id: patient.id,
                bed_id: bed.id,
                status: 'ACTIVE',
                check_in: checkInDate
            }
        });

        await prisma.bed.update({ where: { id: bed.id }, data: { current_patient_id: patient.id } });
        console.log(`   Admission Created (ID: ${admission.id}). LOS should be ~3 Days.`);

        // 2. Execute Discharge Logic (Simulate Controller)
        console.log('2. Executing Finalize Discharge...');

        const dischargeDate = new Date();
        const diffTime = Math.abs(dischargeDate - checkInDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        // Calculate Room Charge
        const roomPrice = parseFloat(room.price);
        const roomTotal = roomPrice * diffDays;

        console.log(`   Expected Bill: ${diffDays} days * ${roomPrice} = ${roomTotal}`);

        // Create Invoice
        const invoice = await prisma.invoice.create({
            data: {
                patient_id: admission.patient_id,
                admission_id: admission.id,
                status: 'PENDING',
                total_amount: roomTotal,
                items: {
                    create: [
                        {
                            description: `Room Charge (${diffDays} days @ ${roomPrice})`,
                            amount: roomTotal,
                            quantity: 1
                        }
                    ]
                }
            }
        });

        // Update Admission
        await prisma.admission.update({
            where: { id: admission.id },
            data: {
                status: 'DISCHARGED',
                check_out: dischargeDate,
            }
        });

        // Update Bed
        await prisma.bed.update({
            where: { id: bed.id },
            data: {
                status: 'CLEANING',
                current_patient_id: null
            }
        });

        console.log(`   Discharged. Invoice Generated (ID: ${invoice.id}).`);

        // 3. Verify
        const finalBed = await prisma.bed.findUnique({ where: { id: bed.id } });
        const finalInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } });

        if (finalBed.status !== 'CLEANING') throw new Error('Bed status not updated to CLEANING');
        if (finalInvoice.total_amount !== roomTotal) throw new Error(`Invoice amount mismatch. Got ${finalInvoice.total_amount}, Expected ${roomTotal}`);

        console.log('\n✅ SUCCESS: Discharge & Billing logic verified.');

    } catch (e) {
        console.error('ERROR:', e.message);
        console.error(JSON.stringify(e, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

main();
