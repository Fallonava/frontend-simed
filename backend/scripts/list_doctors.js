const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const doctors = await prisma.doctor.findMany({
        include: { poliklinik: true }
    });
    console.log(JSON.stringify(doctors, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
