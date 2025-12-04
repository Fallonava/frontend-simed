const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Create Poliklinik
    const poliJantung = await prisma.poliklinik.upsert({
        where: { queue_code: 'JTG' },
        update: {},
        create: { name: 'Poli Jantung', queue_code: 'JTG' }
    });
    const poliAnak = await prisma.poliklinik.upsert({
        where: { queue_code: 'ANK' },
        update: {},
        create: { name: 'Poli Anak', queue_code: 'ANK' }
    });
    const poliKulit = await prisma.poliklinik.upsert({
        where: { queue_code: 'KLT' },
        update: {},
        create: { name: 'Poli Kulit', queue_code: 'KLT' }
    });
    const poliUmum = await prisma.poliklinik.upsert({
        where: { queue_code: 'UMM' },
        update: {},
        create: { name: 'Poli Umum', queue_code: 'UMM' }
    });

    const doctors = [
        {
            name: 'Dr. Sarah Johnson',
            specialist: 'Cardiologist',
            poliklinik_id: poliJantung.id,
            photo_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop'
        },
        {
            name: 'Dr. Michael Chen',
            specialist: 'Pediatrician',
            poliklinik_id: poliAnak.id,
            photo_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop'
        },
        {
            name: 'Dr. Emily Davis',
            specialist: 'Dermatologist',
            poliklinik_id: poliKulit.id,
            photo_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&auto=format&fit=crop'
        },
        {
            name: 'Dr. James Wilson',
            specialist: 'General Practitioner',
            poliklinik_id: poliUmum.id,
            photo_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&auto=format&fit=crop'
        }
    ];

    for (const doctor of doctors) {
        // Check if doctor exists to avoid duplicates (simplified check by name)
        const existing = await prisma.doctor.findFirst({ where: { name: doctor.name } });
        if (!existing) {
            await prisma.doctor.create({ data: doctor });
        }
    }

    // Seed Users
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('loket123', 10);

    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPassword,
            role: 'ADMIN'
        }
    });

    await prisma.user.upsert({
        where: { username: 'loket1' },
        update: {},
        create: {
            username: 'loket1',
            password: staffPassword,
            role: 'STAFF'
        }
    });

    console.log('Seed data inserted');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
