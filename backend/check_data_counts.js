const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCounts() {
    console.log("📊 CHECKING DUMMY DATA COUNTS...");

    try {
        const patients = await prisma.patient.count();
        const polies = await prisma.poliklinik.count();
        const doctors = await prisma.doctor.count();
        const rooms = await prisma.room.count();
        const beds = await prisma.bed.count();
        const medicines = await prisma.medicine.count();

        // Detailed Bed Status
        const availableBeds = await prisma.bed.count({ where: { status: 'AVAILABLE' } });
        const occupiedBeds = await prisma.bed.count({ where: { status: 'OCCUPIED' } });
        const cleaningBeds = await prisma.bed.count({ where: { status: 'CLEANING' } });

        // Transactions / Records
        const queues = await prisma.queue.count();
        const medicalRecords = await prisma.medicalRecord.count();
        const transactions = await prisma.transaction.count();
        const admissions = await prisma.admission.count({ where: { status: 'ACTIVE' } });

        console.log(`\n--- MASTER DATA ---`);
        console.log(`Patients: ${patients}`);
        console.log(`Polikliniks: ${polies}`);
        console.log(`Doctors: ${doctors}`);
        console.log(`Medicines: ${medicines}`);
        console.log(`Rooms: ${rooms}`);
        console.log(`Beds: ${beds}`);

        console.log(`\n--- BED STATUS ---`);
        console.log(`Available: ${availableBeds}`);
        console.log(`Occupied: ${occupiedBeds}`);
        console.log(`Cleaning: ${cleaningBeds}`);

        console.log(`\n--- TRANSACTION DATA ---`);
        console.log(`Today's Queues: ${queues}`); // Note: this counts ALL queues, not just today unless filtered
        console.log(`Medical Records: ${medicalRecords}`);
        console.log(`Active Admissions: ${admissions}`);
        console.log(`Transactions: ${transactions}`);

        // Completeness Check
        const warnings = [];
        if (patients < 10) warnings.push("⚠️ Low Patient Count (Recommend > 10)");
        if (doctors < 5) warnings.push("⚠️ Low Doctor Count (Recommend > 5)");
        if (medicines < 5) warnings.push("⚠️ Low Medicine Count (Recommend > 5)");
        if (beds < 5) warnings.push("⚠️ Low Bed Count (Recommend > 5)");
        if (availableBeds === 0) warnings.push("⚠️ No Available Beds for Admission Testing");

        if (warnings.length > 0) {
            console.log("\n❌ WARNINGS:");
            warnings.forEach(w => console.log(w));
        } else {
            console.log("\n✅ DATA LOOKS SUFFICIENT FOR TESTING");
        }

    } catch (e) {
        console.error("Error checking counts:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkCounts();
