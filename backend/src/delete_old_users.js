const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🗑️ Deleting old staff users...');
    const usersToDelete = [
        'front_office',
        'nurse_station',
        'pharmacy',
        'lab_admin',
        'radiology',
        'cashier',
        'inventory',
        'kitchen'
    ];

    const result = await prisma.user.deleteMany({
        where: {
            username: { in: usersToDelete }
        }
    });

    console.log(`✅ Deleted ${result.count} users.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
