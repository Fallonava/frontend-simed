const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const polies = await prisma.poliklinik.findMany();
        console.log("=== POLIKLINIK LIST ===");
        polies.forEach(p => console.log(`${p.id}: ${p.name} (${p.queue_code})`));

        // Check specific doctor
        const doctorName = "dr. RR Irma Rossyana, Sp. A";
        const docs = await prisma.doctor.findMany({
            where: { name: { contains: "Irma" } },
            include: { poliklinik: true, schedules: true }
        });
        console.log(`\n=== DOCTORS matching 'Irma' ===`);
        console.log(JSON.stringify(docs, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
