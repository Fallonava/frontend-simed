const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser(username, password, role = 'ADMIN') {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { username },
            update: {
                password: hashedPassword,
                role: role
            },
            create: {
                username,
                password: hashedPassword,
                role
            }
        });

        console.log(`User created/updated successfully:`);
        console.log(`Username: ${user.username}`);
        console.log(`Role: ${user.role}`);
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Get args from command line
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node create_user.js <username> <password> [role]');
    process.exit(1);
}

createUser(args[0], args[1], args[2]);
