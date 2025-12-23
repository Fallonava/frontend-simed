const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding patients...');

    const patients = [
        {
            nik: '1000000000000001',
            no_rm: '00-00-91',
            name: 'BUDI SANTOSO (BPJS PBI)',
            birth_date: new Date('1980-01-01'),
            gender: 'L',
            address: 'Jl. Merdeka No. 1, Jakarta',
            phone: '081234567890',
            bpjs_card_no: '000123456001',
            is_bpjs: true,
            allergies: 'Seafood, Debu'
        },
        {
            nik: '1000000000000002',
            no_rm: '00-00-92',
            name: 'SITI AMINAH (BPJS MANDIRI)',
            birth_date: new Date('1995-05-20'),
            gender: 'P',
            address: 'Jl. Mawar No. 12, Bandung',
            phone: '081234567891',
            bpjs_card_no: '000123456002',
            is_bpjs: true,
            allergies: null
        },
        {
            nik: '1000000000000003',
            no_rm: '00-00-93',
            name: 'A. YANI (BPJS TUNGGAKAN)',
            birth_date: new Date('1975-08-17'),
            gender: 'L',
            address: 'Jl. Pahlawan No. 45, Surabaya',
            phone: '081234567892',
            bpjs_card_no: '000123456003',
            is_bpjs: true,
            allergies: 'Penicillin'
        },
        {
            nik: '3201010101010001',
            no_rm: '00-00-94',
            name: 'JOHN DOE (UMUM)',
            birth_date: new Date('1985-12-12'),
            gender: 'L',
            address: 'Jl. Kenanga No. 8, Bogor',
            phone: '081299998888',
            bpjs_card_no: null,
            is_bpjs: false,
            allergies: null
        },
        {
            nik: '3201010101010002',
            no_rm: '00-00-95',
            name: 'JANE DOE (UMUM)',
            birth_date: new Date('1990-03-30'),
            gender: 'P',
            address: 'Jl. Anggrek No. 3, Depok',
            phone: '081277776666',
            bpjs_card_no: null,
            is_bpjs: false,
            allergies: 'Kacang'
        }
    ];

    for (const p of patients) {
        const exists = await prisma.patient.findUnique({
            where: { nik: p.nik }
        });

        if (!exists) {
            await prisma.patient.create({ data: p });
            console.log(`Created patient: ${p.name}`);
        } else {
            console.log(`Skipped patient (already exists): ${p.name}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
