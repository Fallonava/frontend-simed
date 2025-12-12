const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Dummy Patient Seeding...');

    const dummyPatients = [
        {
            name: 'Budi Santoso',
            nik: '3301010101800001',
            no_rm: 'RM-2024-001',
            bpjs_no: '000123456001',
            birth_date: new Date('1980-05-12'),
            gender: 'Laki-laki',
            address: 'Jl. Merdeka No. 1, Jakarta',
            phone: '081234567890',
            allergies: 'Antibiotik (Penicillin)'
        },
        {
            name: 'Siti Aminah',
            nik: '3301010101850002',
            no_rm: 'RM-2024-002',
            bpjs_no: '000123456002',
            birth_date: new Date('1985-08-20'),
            gender: 'Perempuan',
            address: 'Jl. Sudirman No. 45, Bandung',
            phone: '081234567891',
            allergies: null
        },
        {
            name: 'Agus Setiawan',
            nik: '3301010101900003',
            no_rm: 'RM-2024-003',
            bpjs_no: null, // Pasien Umum
            birth_date: new Date('1990-12-10'),
            gender: 'Laki-laki',
            address: 'Jl. Diponegoro No. 10, Surabaya',
            phone: '081234567892',
            allergies: 'Seafood, Kacang'
        },
        {
            name: 'Dewi Lestari',
            nik: '3301010101950004',
            no_rm: 'RM-2024-004',
            bpjs_no: '000123456004',
            birth_date: new Date('1995-03-15'),
            gender: 'Perempuan',
            address: 'Jl. Malioboro No. 5, Yogyakarta',
            phone: '081234567893',
            allergies: null
        },
        {
            name: 'Eko Prasetyo',
            nik: '3301010101750005',
            no_rm: 'RM-2024-005',
            bpjs_no: '000123456005',
            birth_date: new Date('1975-07-07'),
            gender: 'Laki-laki',
            address: 'Jl. Pahlawan No. 99, Semarang',
            phone: '081234567894',
            allergies: 'Debu'
        },
        {
            name: 'Rina Wati',
            nik: '3301010101880006',
            no_rm: 'RM-2024-006',
            bpjs_no: null,
            birth_date: new Date('1988-02-28'),
            gender: 'Perempuan',
            address: 'Jl. Ahmad Yani No. 20, Solo',
            phone: '081234567895',
            allergies: 'Paracetamol'
        },
        {
            name: 'Jokowi Widodo',
            nik: '3301010101610007',
            no_rm: 'RM-2024-007',
            bpjs_no: '000123456007',
            birth_date: new Date('1961-06-21'),
            gender: 'Laki-laki',
            address: 'Istana Bogor',
            phone: '081234567896',
            allergies: null
        }
    ];

    for (const p of dummyPatients) {
        // Check if exists by NIK to avoid duplicates
        const existing = await prisma.patient.findFirst({ where: { nik: p.nik } });
        if (!existing) {
            await prisma.patient.create({ data: p });
            console.log(`✅ Created patient: ${p.name}`);
        } else {
            console.log(`⚠️ Patient ${p.name} already exists.`);
        }
    }

    console.log('✅ Dummy Patient Seeding Completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
