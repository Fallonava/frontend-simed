const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('👷 Seeding HR Data...');

    // 1. Create Shifts
    const shifts = [
        { name: 'Pagi', start: '07:00', end: '14:00', color: 'green' },
        { name: 'Siang', start: '14:00', end: '21:00', color: 'yellow' },
        { name: 'Malam', start: '21:00', end: '07:00', color: 'blue' }
    ];

    for (const s of shifts) {
        const exist = await prisma.shift.findFirst({ where: { name: s.name } });
        if (!exist) {
            await prisma.shift.create({
                data: { name: s.name, start_time: s.start, end_time: s.end, color: s.color }
            });
            console.log(`Created Shift: ${s.name}`);
        }
    }

    // 2. Create Employees (Sync with Users)
    // Find 'admin' and 'nurse' users
    const users = await prisma.user.findMany({
        where: { role: { in: ['admin', 'nurse', 'staff'] } }
    });

    for (const user of users) {
        // Check if employee profile exists
        const exist = await prisma.employee.findUnique({ where: { user_id: user.id } });
        if (!exist) {
            await prisma.employee.create({
                data: {
                    full_name: user.username.toUpperCase(),
                    nip: `EMP-${user.id}${Math.floor(Math.random() * 1000)}`,
                    role: user.role.toUpperCase(),
                    user_id: user.id,
                    join_date: new Date()
                }
            });
            console.log(`Created Employee Profile: ${user.username}`);
        }
    }

    // 3. Create Schedule for Next 7 Days
    const employees = await prisma.employee.findMany();
    const allShifts = await prisma.shift.findMany();

    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        for (const emp of employees) {
            // Random shift assignment (80% chance working)
            if (Math.random() > 0.2) {
                const randomShift = allShifts[Math.floor(Math.random() * allShifts.length)];

                // Check if schedule exists
                const existingSchedule = await prisma.employeeSchedule.findUnique({
                    where: {
                        employee_id_date: {
                            employee_id: emp.id,
                            date: date
                        }
                    }
                });

                if (!existingSchedule) {
                    await prisma.employeeSchedule.create({
                        data: {
                            employee_id: emp.id,
                            shift_id: randomShift.id,
                            date: date
                        }
                    });
                }
            }
        }
    }
    console.log('✅ Schedule Generated for 7 Days');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
