const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('Connecting to database...');
        // Just try to count users to see if table exists and has data
        const userCount = await prisma.user.count();
        console.log(`Connection successful. Found ${userCount} users.`);

        const users = await prisma.user.findMany({ select: { username: true } });
        console.log('Users:', users.map(u => u.username).join(', '));
    } catch (e) {
        console.error('Check failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
