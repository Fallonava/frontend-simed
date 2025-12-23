const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createIGD() {
    console.log("🛠️ FIXING MISSING IGD DATA...");

    try {
        // 1. Create/Ensure Poliklinik IGD
        let igd = await prisma.poliklinik.findFirst({
            where: { name: 'Instalasi Gawat Darurat (IGD)' }
        });

        if (!igd) {
            igd = await prisma.poliklinik.create({
                data: {
                    name: 'Instalasi Gawat Darurat (IGD)',
                    queue_code: 'IGD' // Standard prefix
                }
            });
            console.log(`✅ Created Poliklinik: ${igd.name}`);
        } else {
            console.log(`ℹ️ Poliklinik ${igd.name} already exists.`);
        }

        // 2. Create/Ensure IGD Doctor
        const docName = 'dr. Jaga IGD';
        let doc = await prisma.doctor.findFirst({
            where: { name: docName }
        });

        if (!doc) {
            doc = await prisma.doctor.create({
                data: {
                    name: docName,
                    specialist: 'Dokter Umum',
                    poliklinik_id: igd.id
                }
            });
            console.log(`✅ Created Doctor: ${doc.name}`);
        } else {
            // Ensure linked to IGD
            if (doc.poliklinik_id !== igd.id) {
                await prisma.doctor.update({
                    where: { id: doc.id },
                    data: { poliklinik_id: igd.id }
                });
                console.log(`✅ Re-assigned ${doc.name} to IGD.`);
            } else {
                console.log(`ℹ️ Doctor ${doc.name} exists and is assigned correctly.`);
            }
        }

        // 3. Create Daily Quota for Today so they appear available
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const quota = await prisma.dailyQuota.findFirst({
            where: { doctor_id: doc.id, date: today }
        });

        if (!quota) {
            await prisma.dailyQuota.create({
                data: {
                    doctor_id: doc.id,
                    date: today,
                    max_quota: 100, // Unlimited usually
                    status: 'OPEN'
                }
            });
            console.log(`✅ Opened Daily Quota for ${doc.name}`);
        }

        console.log("\n🚑 IGD READY FOR TESTING!");

    } catch (e) {
        console.error("Error creating IGD:", e);
    } finally {
        await prisma.$disconnect();
    }
}

createIGD();
