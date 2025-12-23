const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("💸 Seeding Expenses...");

    const expenses = [
        { description: 'Electricity Bill (PLN) - Dec', amount: 15000000, category: 'OPERATIONAL', date: new Date('2024-12-05') },
        { description: 'Water Bill (PDAM) - Dec', amount: 3500000, category: 'OPERATIONAL', date: new Date('2024-12-05') },
        { description: 'Internet (Indihome) - Dec', amount: 1200000, category: 'OPERATIONAL', date: new Date('2024-12-05') },
        { description: 'Staff Payroll - Doctors', amount: 150000000, category: 'SALARY', date: new Date('2024-12-25') },
        { description: 'Staff Payroll - Nurses', amount: 85000000, category: 'SALARY', date: new Date('2024-12-25') },
        { description: 'Staff Payroll - Admin', amount: 45000000, category: 'SALARY', date: new Date('2024-12-25') },
        { description: 'Medical Supplies Restock', amount: 25000000, category: 'PURCHASE', date: new Date('2024-12-10') },
        { description: 'Office Consumables (Paper/Ink)', amount: 1500000, category: 'PURCHASE', date: new Date('2024-12-12') },
        { description: 'AC Maintenance (Poli)', amount: 2500000, category: 'MAINTENANCE', date: new Date('2024-12-15') },
        { description: 'Facebook Ads Promotion', amount: 5000000, category: 'MARKETING', date: new Date('2024-12-18') },
    ];

    for (const exp of expenses) {
        await prisma.expense.create({ data: exp });
    }

    console.log(`✅ Seeded ${expenses.length} expense records.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
