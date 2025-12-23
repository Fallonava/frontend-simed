const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const nik = '1234567890123456';
    const existing = await prisma.patient.findUnique({ where: { nik } });

    if (existing) {
        console.log(`Patient with NIK ${nik} already exists.`);
        return;
    }

    const patient = await prisma.patient.create({
        data: {
            nik: nik,
            no_rm: '00-99-99',
            name: 'Pasien Test Mobile',
            gender: 'L',
            birth_date: new Date('1990-01-01'),
            address: 'Jalan Mobile App No. 1',
            phone: '081234567890'
        }
    });

    console.log(`Created test patient: ${patient.name} (NIK: ${patient.nik})`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
