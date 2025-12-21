
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding New Master Data...');

    // 1. SEED ROOMS
    const roomCount = await prisma.room.count();
    if (roomCount === 0) {
        console.log('Seeding Rooms...');
        await prisma.room.createMany({
            data: [
                { name: 'Mawar 01', type: 'VIP', price: 1500000, gender: 'CAMPUR' },
                { name: 'Mawar 02', type: 'VIP', price: 1500000, gender: 'CAMPUR' },
                { name: 'Anggrek 01', type: 'KELAS_1', price: 750000, gender: 'P' },
                { name: 'Anggrek 02', type: 'KELAS_1', price: 750000, gender: 'L' },
                { name: 'Melati 01', type: 'KELAS_2', price: 500000, gender: 'P' },
                { name: 'Melati 02', type: 'KELAS_2', price: 500000, gender: 'L' },
                { name: 'Kenanga 01', type: 'KELAS_3', price: 250000, gender: 'CAMPUR' },
                { name: 'ICU 01', type: 'ICU', price: 2500000, gender: 'CAMPUR' },
            ]
        });

        // Seed Beds for Rooms
        const rooms = await prisma.room.findMany();
        for (const room of rooms) {
            const bedCount = room.type === 'VIP' ? 1 : room.type === 'KELAS_1' ? 2 : 4;
            const beds = [];
            for (let i = 0; i < bedCount; i++) {
                beds.push({
                    room_id: room.id,
                    code: String.fromCharCode(65 + i), // A, B, C...
                    status: 'AVAILABLE'
                });
            }
            await prisma.bed.createMany({ data: beds });
        }
    }

    // 2. SEED TARIFFS
    const tariffCount = await prisma.serviceTariff.count();
    if (tariffCount === 0) {
        console.log('Seeding Tariffs...');
        await prisma.serviceTariff.createMany({
            data: [
                { name: 'Konsultasi Dokter Umum', category: 'MEDIS', price: 30000, unit: 'Kali', code: 'JASA-GP' },
                { name: 'Konsultasi Dokter Spesialis', category: 'MEDIS', price: 100000, unit: 'Kali', code: 'JASA-SP' },
                { name: 'Pemeriksaan Darah Lengkap', category: 'PENUNJANG', price: 120000, unit: 'Kali', code: 'LAB-DL' },
                { name: 'Rontgen Thorax', category: 'PENUNJANG', price: 200000, unit: 'Kali', code: 'RAD-THX' },
                { name: 'Biaya Administrasi Rawat Inap', category: 'ADMINISTRASI', price: 50000, unit: 'Hari', code: 'ADM-RI' },
                { name: 'Pemasangan Infus', category: 'MEDIS', price: 75000, unit: 'Tindakan', code: 'TIN-INF' },
                { name: 'Nebulizer', category: 'MEDIS', price: 60000, unit: 'Tindakan', code: 'TIN-NEB' },
            ]
        });
    }

    // 3. SEED DIET MENUS
    const menuCount = await prisma.dietMenu.count();
    if (menuCount === 0) {
        console.log('Seeding Diet Menus...');
        await prisma.dietMenu.createMany({
            data: [
                { name: 'Nasi Biasa (Lauk Standar)', code: 'D-REG', type: 'REGULAR', calories: 2000, description: 'Nasi, Ayam/Ikan, Sayur, Buah' },
                { name: 'Bubur Saring', code: 'D-SOFT', type: 'SOFT', calories: 1500, description: 'Bubur Halus, Telur Rebus, Sayur Cincang' },
                { name: 'Diet Rendah Garam (RG)', code: 'D-RG', type: 'DIET_RG', calories: 1800, description: 'Tanpa Garam Tambahan, Rendah Lemak' },
                { name: 'Diet Diabetes (DM)', code: 'D-DM', type: 'DIET_DM', calories: 1700, description: 'Nasi Merah, Kukus/Rebus, Tanpa Gula' },
                { name: 'Cair / Liquid', code: 'D-LIQ', type: 'LIQUID', calories: 1000, description: 'Susu, Jus Buah, Kaldu' },
            ]
        });
    }

    console.log('Seeding Complete!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
