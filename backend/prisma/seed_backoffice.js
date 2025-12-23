const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Back Office data...');

    // 1. Fixed Assets
    await prisma.fixedAsset.upsert({
        where: { code: 'MRI-01' },
        update: {},
        create: {
            name: 'MRI 3 Tesla - Siemens',
            code: 'MRI-01',
            purchase_date: new Date('2022-01-01'),
            purchase_price: 15000000000, // 15 Billion
            useful_life: 10,
            status: 'OPERATIONAL'
        }
    });

    await prisma.fixedAsset.upsert({
        where: { code: 'CT-01' },
        update: {},
        create: {
            name: 'CT-Scan 128 Slice - GE',
            code: 'CT-01',
            purchase_date: new Date('2023-05-15'),
            purchase_price: 8000000000, // 8 Billion
            useful_life: 8,
            status: 'MAINTENANCE'
        }
    });

    // 2. Doctor Fee Log (Mock)
    const doctors = await prisma.employee.findMany({ where: { role: 'DOCTOR' } });
    if (doctors.length > 0) {
        await prisma.doctorFeeLog.create({
            data: {
                doctor_id: doctors[0].id,
                invoice_id: 1,
                patient_name: 'Patient Test',
                service_name: 'Consultation + Surgery',
                amount: 1500000,
                status: 'PENDING'
            }
        });
    }

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
