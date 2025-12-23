const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Medical Support data...');

    // 1. Blood Bank
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    await prisma.bloodBag.upsert({
        where: { bag_number: 'BAG-001' },
        update: {},
        create: {
            bag_number: 'BAG-001',
            blood_type: 'O',
            rhesus: '+',
            component_type: 'PRC',
            expiry_date: expiry,
            status: 'AVAILABLE'
        }
    });

    await prisma.bloodBag.upsert({
        where: { bag_number: 'BAG-002' },
        update: {},
        create: {
            bag_number: 'BAG-002',
            blood_type: 'A',
            rhesus: '+',
            component_type: 'TC',
            expiry_date: new Date(Date.now() + 86400000 * 3), // 3 days
            status: 'AVAILABLE'
        }
    });

    // 2. CSSD
    await prisma.sterileSet.upsert({
        where: { qr_code: 'SET-BEDAH-01' },
        update: {},
        create: {
            name: 'Set Bedah Saraf 01',
            qr_code: 'SET-BEDAH-01',
            status: 'READY',
            last_sterile_at: new Date(),
            expiry_date: new Date(Date.now() + 86400000 * 7)
        }
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
