const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const doctors = [
        {
            name: 'Dr. Sarah Johnson',
            specialist: 'Cardiologist',
            poli_name: 'Poli Jantung',
            photo_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop'
        },
        {
            name: 'Dr. Michael Chen',
            specialist: 'Pediatrician',
            poli_name: 'Poli Anak',
            photo_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop'
        },
        {
            name: 'Dr. Emily Davis',
            specialist: 'Dermatologist',
            poli_name: 'Poli Kulit',
            photo_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&auto=format&fit=crop'
        },
        {
            name: 'Dr. James Wilson',
            specialist: 'General Practitioner',
            poli_name: 'Poli Umum',
            photo_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&auto=format&fit=crop'
        }
    ];

    for (const doctor of doctors) {
        await prisma.doctor.create({
            data: doctor
        });
    }

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
