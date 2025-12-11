const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Check Eko Subekti (ID 32) on 19 Dec
    const leave = await prisma.doctorLeave.findFirst({
        where: {
            doctor_id: 32,
            date: {
                gte: new Date('2025-12-19T00:00:00.000Z'),
                lte: new Date('2025-12-19T23:59:59.000Z')
            }
        },
        include: { doctor: true }
    });
    console.log(JSON.stringify(leave, null, 2));

    // Count total leaves inserted
    const count = await prisma.doctorLeave.count();
    console.log(`Total leaves in DB: ${count}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
