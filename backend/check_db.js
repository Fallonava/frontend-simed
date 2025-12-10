const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const polyCount = await prisma.poliklinik.count();
        const doctorCount = await prisma.doctor.count();
        const patientCount = await prisma.patient.count();

        console.log(`Polikliniks: ${polyCount}`);
        console.log(`Doctors: ${doctorCount}`);
        console.log(`Patients: ${patientCount}`);

        const polies = await prisma.poliklinik.findMany({ take: 3 });
        console.log('Sample Polies:', JSON.stringify(polies, null, 2));

    } catch (error) {
        console.error('Database Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
