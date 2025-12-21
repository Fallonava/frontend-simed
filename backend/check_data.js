
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        const polyCount = await prisma.poliklinik.count();
        const doctorCount = await prisma.doctor.count();
        const roomCount = await prisma.room.count();
        const tariffCount = await prisma.serviceTariff.count();
        const menuCount = await prisma.dietMenu.count();

        console.log(`Poliklinik: ${polyCount}`);
        console.log(`Doctors: ${doctorCount}`);
        console.log(`Rooms: ${roomCount}`);
        console.log(`Tariffs: ${tariffCount}`);
        console.log(`DietMenus: ${menuCount}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
