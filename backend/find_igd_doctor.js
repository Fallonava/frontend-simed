const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findIGDDoctor() {
    console.log("🚑 SEARCHING FOR IGD DOCTORS...");

    try {
        // Find IGD Polyclinic
        const polies = await prisma.poliklinik.findMany({
            where: {
                name: { contains: 'IGD', mode: 'insensitive' }
            }
        });

        if (polies.length === 0) {
            console.log("❌ No Polyclinic found with name containing 'IGD'");

            // Fallback: Check for 'Umum' as sometimes they double as IGD
            console.log("   Checking for 'Poli Umum' as fallback...");
            const umum = await prisma.poliklinik.findFirst({ where: { name: { contains: 'Umum' } } });
            if (umum) polies.push(umum);
        }

        for (const poli of polies) {
            console.log(`\nFound Poly: ${poli.name} (ID: ${poli.id})`);

            const doctors = await prisma.doctor.findMany({
                where: { poliklinik_id: poli.id }
            });

            if (doctors.length > 0) {
                doctors.forEach(d => {
                    console.log(`   - 👨‍⚕️ ${d.name} (${d.specialist})`);
                });
            } else {
                console.log("   ⚠️ No doctors assigned to this poly.");
            }
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

findIGDDoctor();
