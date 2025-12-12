const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('Verifying data...');
        const users = await prisma.user.count();
        const doctors = await prisma.doctor.count();
        const polikliniks = await prisma.poliklinik.count();

        console.log(`Users: ${users}`);
        console.log(`Doctors: ${doctors}`);
        console.log(`Polikliniks: ${polikliniks}`);

        // We expect > 0 for these based on the dump
        if (users > 0 && doctors > 0 && polikliniks > 0) {
            console.log("Verification SUCCESS: Data found.");
        } else {
            console.log("Verification WARNING: Some tables are empty.");
        }

    } catch (e) {
        console.error('Verification failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
