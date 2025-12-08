const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const poliCount = await prisma.poliklinik.count();
        const doctorCount = await prisma.doctor.count();
        const scheduleCount = await prisma.doctorSchedule.count();

        console.log("=== VERIFICATION RESULTS ===");
        console.log(`Poliklinik Count: ${poliCount}`);
        console.log(`Doctor Count:     ${doctorCount}`);
        console.log(`Schedule Count:   ${scheduleCount}`);

        if (doctorCount > 0) {
            const sample = await prisma.doctor.findFirst({
                include: { poliklinik: true, schedules: true }
            });
            console.log("Sample Doctor:", JSON.stringify(sample, null, 2));
        }

    } catch (e) {
        console.error("Verification Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
