const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Rooms & Beds...');

    // 1. VIP (Single Bed)
    const vip = await prisma.room.create({
        data: {
            name: 'Paviliun VIP A',
            type: 'VIP',
            price: 1500000,
            gender: 'CAMPUR',
            beds: {
                create: [
                    { code: 'VIP-A1', status: 'AVAILABLE' }
                ]
            }
        }
    });
    console.log('Created VIP Room:', vip.name);

    // 2. KELAS 1 (2 Beds)
    const k1 = await prisma.room.create({
        data: {
            name: 'Mawar 01',
            type: 'KELAS_1',
            price: 800000,
            gender: 'L', // Laki-laki
            beds: {
                create: [
                    { code: 'M1-A', status: 'AVAILABLE' },
                    { code: 'M1-B', status: 'OCCUPIED' } // Simulasi terisi
                ]
            }
        }
    });
    console.log('Created Kelas 1 Room:', k1.name);

    // 3. KELAS 2 (4 Beds)
    const k2 = await prisma.room.create({
        data: {
            name: 'Melati 01',
            type: 'KELAS_2',
            price: 500000,
            gender: 'P', // Perempuan
            beds: {
                create: [
                    { code: 'ML1-A', status: 'AVAILABLE' },
                    { code: 'ML1-B', status: 'AVAILABLE' },
                    { code: 'ML1-C', status: 'CLEANING' },
                    { code: 'ML1-D', status: 'AVAILABLE' }
                ]
            }
        }
    });

    // 4. KELAS 3 (6 Beds)
    const k3 = await prisma.room.create({
        data: {
            name: 'Anggrek 01',
            type: 'KELAS_3',
            price: 200000,
            gender: 'CAMPUR',
            beds: {
                create: [
                    { code: 'AG1-1', status: 'AVAILABLE' },
                    { code: 'AG1-2', status: 'AVAILABLE' },
                    { code: 'AG1-3', status: 'AVAILABLE' },
                    { code: 'AG1-4', status: 'AVAILABLE' },
                    { code: 'AG1-5', status: 'AVAILABLE' },
                    { code: 'AG1-6', status: 'MAINTENANCE' }
                ]
            }
        }
    });

    console.log('✅ Seeding Inpatient Data Completed');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
