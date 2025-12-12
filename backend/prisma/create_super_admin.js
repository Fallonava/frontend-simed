const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Creating super admin user...');

    const username = 'superadmin';
    const password = 'SuperAdmin123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { username: username },
            update: {
                password: hashedPassword,
                role: 'ADMIN' // Ensure role is ADMIN
            },
            create: {
                username: username,
                password: hashedPassword,
                role: 'ADMIN'
            }
        });

        console.log(`\nSUCCESS! Super Admin user created/updated.`);
        console.log(`Username: ${user.username}`);
        console.log(`Password: ${password}`);
        console.log(`Role: ${user.role}\n`);

    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
