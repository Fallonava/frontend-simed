const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tables = [
        'Poliklinik',
        'Doctor',
        'DoctorLeave',
        'DoctorSchedule',
        'DailyQuota',
        'Queue',
        'User',
        'Counter'
    ];

    console.log('Enabling RLS on tables...');

    for (const table of tables) {
        try {
            // Using executeRawUnsafe because table names are identifiers
            await prisma.$executeRawUnsafe(`ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY;`);
            console.log(`✅ Enabled RLS for table: ${table}`);
        } catch (error) {
            console.error(`❌ Failed to enable RLS for table: ${table}`, error);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
