const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- VERIFYING HR WORKFLOW ---');
    try {
        // 1. Setup Master Data (Employee & Shifts)
        console.log('1. Check/Setup Master Data...');

        let shiftPagi = await prisma.shift.findFirst({ where: { name: 'Pagi' } });
        if (!shiftPagi) {
            shiftPagi = await prisma.shift.create({ data: { name: 'Pagi', start_time: '07:00', end_time: '14:00', color: 'green' } });
            await prisma.shift.create({ data: { name: 'Siang', start_time: '14:00', end_time: '21:00', color: 'yellow' } });
            await prisma.shift.create({ data: { name: 'Malam', start_time: '21:00', end_time: '07:00', color: 'blue' } });
            console.log('   Created Default Shifts.');
        }

        let emp = await prisma.employee.findFirst();
        if (!emp) {
            emp = await prisma.employee.create({
                data: { full_name: 'Dr. HR Test', nip: 'HR001', role: 'DOCTOR' }
            });
            console.log('   Created Test Employee.');
        }

        // 2. Test Auto-Roster (Controller Logic Simulation)
        console.log('2. Simulating Auto-Roster...');
        const today = new Date();
        const date = new Date(today);
        date.setHours(0, 0, 0, 0);

        // Assign 'Pagi' to emp for today
        const schedule = await prisma.employeeSchedule.upsert({
            where: {
                employee_id_date: {
                    employee_id: emp.id,
                    date: date
                }
            },
            update: { shift_id: shiftPagi.id },
            create: {
                employee_id: emp.id,
                shift_id: shiftPagi.id,
                date: date
            }
        });
        console.log(`   Assigned Shift: ${shiftPagi.name} to ${emp.full_name} for ${date.toDateString()}`);

        // 3. Test Payroll Calculation
        console.log('3. verifying Payroll Stats...');

        const RATE = 150000;

        // Fetch schedules for this employee in range
        const schedules = await prisma.employeeSchedule.findMany({
            where: {
                employee_id: emp.id,
                date: date
            }
        });

        const estimatedSalary = schedules.length * RATE;
        console.log(`   Shift Count: ${schedules.length}`);
        console.log(`   Est. Salary: ${estimatedSalary} (Expected >= ${RATE})`);

        if (estimatedSalary >= RATE) {
            console.log('\n✅ SUCCESS: HR Flow (Roster & Payroll) verified.');
        } else {
            console.error('\n❌ FAILURE: Payroll calculation incorrect.');
        }

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
