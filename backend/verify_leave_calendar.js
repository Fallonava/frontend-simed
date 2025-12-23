const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Verifying Leave Management Workflow...");

    // 1. Find a Doctor
    const doctor = await prisma.doctor.findFirst();
    if (!doctor) {
        console.error("❌ No doctor found. Please seed doctors first.");
        return;
    }
    console.log(`✅ Found Doctor: ${doctor.name} (ID: ${doctor.id})`);

    // 2. Add Leave
    const leaveDate = new Date();
    leaveDate.setDate(leaveDate.getDate() + 1); // Tomorrow
    leaveDate.setHours(0, 0, 0, 0);

    console.log(`👉 Adding Leave for ${leaveDate.toISOString()}...`);
    try {
        // Cleanup existing test leave if any
        await prisma.doctorLeave.deleteMany({
            where: {
                doctor_id: doctor.id,
                date: leaveDate
            }
        });

        const newLeave = await prisma.doctorLeave.create({
            data: {
                doctor_id: doctor.id,
                date: leaveDate,
                reason: "Test Leave Script"
            }
        });
        console.log(`✅ Leave Created: ID ${newLeave.id}`);

        // 3. Get Leaves
        const leaves = await prisma.doctorLeave.findMany({
            where: { doctor_id: doctor.id }
        });
        console.log(`✅ Found ${leaves.length} leaves for doctor.`);
        const verifyLeave = leaves.find(l => l.id === newLeave.id);
        if (verifyLeave) {
            console.log("✅ Verified newly created leave in list.");
        } else {
            console.error("❌ Failed to find new leave in list.");
        }

        // 4. Delete Leave
        await prisma.doctorLeave.delete({
            where: { id: newLeave.id }
        });
        console.log(`✅ Leave Deleted: ID ${newLeave.id}`);

    } catch (e) {
        console.error("❌ Error during verification:", e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
