const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const doctorName = "Endro";
        const docs = await prisma.doctor.findMany({
            where: { name: { contains: "Endro" } },
            include: { poliklinik: true, schedules: true }
        });
        console.log(`\n=== DOCTORS matching 'Endro' ===`);
        console.log(JSON.stringify(docs, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
