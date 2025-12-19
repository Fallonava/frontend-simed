const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('💰 Seeding Finance Data...');

    // Get some patients
    const patients = await prisma.patient.findMany({ take: 5 });

    // Clear old pending invoices
    await prisma.invoice.deleteMany({ where: { status: 'PENDING' } });

    for (const p of patients) {
        // Create a random invoice
        const invoice = await prisma.invoice.create({
            data: {
                patient_id: p.id,
                total_amount: 150000 + Math.floor(Math.random() * 500000),
                status: 'PENDING',
                items: {
                    create: [
                        { description: 'Konsultasi Dokter Umum', amount: 50000, quantity: 1 },
                        { description: 'Paracetamol 500mg', amount: 5000, quantity: 10 },
                        { description: 'Vitamin C Injection', amount: 75000, quantity: 1 }
                    ]
                }
            }
        });
        console.log(`Created Invoice for ${p.name}: Rp ${invoice.total_amount}`);
    }

    console.log('✅ Finance Seed Done.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
