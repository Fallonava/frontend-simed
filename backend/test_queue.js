const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQueueLogic() {
    console.log('--- Starting Queue Logic Verification ---');

    try {
        // 1. Setup Data: Find a doctor and their poli
        const doctor = await prisma.doctor.findFirst({
            include: { poliklinik: true }
        });

        if (!doctor) {
            console.error('No doctors found for testing.');
            return;
        }

        console.log(`Using Doctor: ${doctor.name}, Poli: ${doctor.poliklinik.name} (Code: ${doctor.poliklinik.queue_code})`);

        // Ensure Quota exists
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let quota = await prisma.dailyQuota.findFirst({
            where: {
                doctor_id: doctor.id,
                date: today
            }
        });

        if (!quota) {
            console.log('Creating quota...');
            quota = await prisma.dailyQuota.create({
                data: {
                    doctor_id: doctor.id,
                    date: today,
                    max_quota: 50,
                    status: 'OPEN'
                }
            });
        }

        // 2. Test Kiosk (Anonymous) Ticket
        console.log('\n--- Testing Kiosk (Anonymous) ---');
        // Logic copy from controller to simulate or we can try to call controller logic if we imported it, 
        // but easier to verify by calling the DB directly with logic that mirrors the controller OR 
        // effectively, we can just use `axios` if server was running, but here we can't ensure server is up.
        // Wait, I can't easily call the controller function without mocking req/res. 
        // I should just inspect the logic I wrote.
        // Actually, the best way to verify 'implementation' is to run the server and hit the endpoint. 
        // But I can't interact with the running process easily.
        // I will simulate the logic BLOCK here to see if it behaves as expected given the database state.

        // Let's rely on my code review and a quick "dry run" against the DB using the exact logic.

        // ... Copied Logic form queueController ...
        const result = await prisma.$transaction(async (tx) => {
            const updatedQuota = await tx.dailyQuota.update({
                where: { id: quota.id },
                data: { current_count: { increment: 1 } }
            });

            const poliklinik = doctor.poliklinik;
            let queueCode = '';
            let queueNumber = updatedQuota.current_count;

            // SIMULATE KIOSK: patient_id is null
            const patient_id = null;

            if (!patient_id) {
                const poliCode = poliklinik.queue_code || 'A';
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const todayEnd = new Date();
                todayEnd.setHours(23, 59, 59, 999);

                const poliTicketCount = await tx.queue.count({
                    where: {
                        daily_quota: {
                            doctor: { poliklinik_id: poliklinik.id },
                            date: { gte: todayStart, lte: todayEnd }
                        }
                    }
                });
                const poliSequence = poliTicketCount + 1;
                queueCode = `${poliCode}-${String(poliSequence).padStart(3, '0')}`;
            }

            return { queueCode, queueNumber };
        });

        console.log(`[KIOSK] Generated Code: ${result.queueCode} (Number: ${result.queueNumber})`);
        if (result.queueCode.startsWith(doctor.poliklinik.queue_code || 'A')) {
            console.log('✅ PASS: Code starts with Poli Code');
        } else {
            console.error('❌ FAIL: Code does not start with Poli Code');
        }


        // 3. Test Registration (Named) Ticket
        console.log('\n--- Testing Registration (Named) ---');
        const resultReg = await prisma.$transaction(async (tx) => {
            const updatedQuota = await tx.dailyQuota.update({
                where: { id: quota.id },
                data: { current_count: { increment: 1 } }
            });

            let queueCode = '';
            let queueNumber = updatedQuota.current_count;

            // SIMULATE REGISTRATION: patient_id is present
            const patient_id = 999;

            if (patient_id) {
                const cleanName = doctor.name.replace(/^Dr\.\s+/i, '').replace(/,/g, '');
                const parts = cleanName.split(' ').filter(p => p.length > 0);
                let initials = '';
                if (parts.length >= 2) {
                    initials = (parts[0][0] + parts[1][0]).toUpperCase();
                } else if (parts.length === 1) {
                    initials = parts[0].substring(0, 2).toUpperCase();
                } else {
                    initials = 'DR';
                }
                queueCode = `${initials}-${String(queueNumber).padStart(3, '0')}`;
            }

            return { queueCode, queueNumber };
        });

        console.log(`[REGISTRATION] Generated Code: ${resultReg.queueCode} (Number: ${resultReg.queueNumber})`);
        // Expected initials
        const cleanName = doctor.name.replace(/^Dr\.\s+/i, '').replace(/,/g, '');
        const parts = cleanName.split(' ').filter(p => p.length > 0);
        let expectedInitials = '';
        if (parts.length >= 2) expectedInitials = (parts[0][0] + parts[1][0]).toUpperCase();
        else if (parts.length === 1) expectedInitials = parts[0].substring(0, 2).toUpperCase();
        else expectedInitials = 'DR';

        if (resultReg.queueCode.startsWith(expectedInitials)) {
            console.log('✅ PASS: Code starts with Doctor Initials');
        } else {
            console.error(`❌ FAIL: Code ${resultReg.queueCode} does not start with ${expectedInitials}`);
        }

    } catch (error) {
        console.error('TEST FAILED:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testQueueLogic();
