const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/hr/employees
exports.getEmployees = async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            include: { user: { select: { username: true, role: true } } },
            orderBy: { full_name: 'asc' }
        });
        res.json({ success: true, data: employees });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
};

// PUT /api/hr/employee/:id
exports.updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { full_name, nip, sip_str, phone } = req.body;
    try {
        const updated = await prisma.employee.update({
            where: { id: parseInt(id) },
            data: { full_name, nip, sip_str, phone }
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update employee' });
    }
};

// GET /api/hr/roster?start=2023-10-01&end=2023-10-07
exports.getRoster = async (req, res) => {
    const { start, end } = req.query;
    try {
        const schedules = await prisma.employeeSchedule.findMany({
            where: {
                date: {
                    gte: new Date(start),
                    lte: new Date(end)
                }
            },
            include: {
                employee: true,
                shift: true
            }
        });

        // Get all shifts for reference
        const shifts = await prisma.shift.findMany();

        res.json({ success: true, schedules, shifts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch roster' });
    }
};

// POST /api/hr/schedule
exports.assignShift = async (req, res) => {
    const { employeeId, shiftId, date } = req.body;
    try {
        const schedule = await prisma.employeeSchedule.upsert({
            where: {
                employee_id_date: {
                    employee_id: parseInt(employeeId),
                    date: new Date(date)
                }
            },
            update: { shift_id: parseInt(shiftId) },
            create: {
                employee_id: parseInt(employeeId),
                shift_id: parseInt(shiftId),
                date: new Date(date)
            }
        });
        res.json({ success: true, data: schedule });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to assign shift' });
    }
};

// AUTO-ROSTER: Generates a random schedule for the next 7 days
exports.autoGenerateRoster = async (req, res) => {
    try {
        const today = new Date();
        const employees = await prisma.employee.findMany();
        const shifts = await prisma.shift.findMany();

        if (employees.length === 0 || shifts.length === 0) {
            return res.status(400).json({ error: 'No employees or shifts found' });
        }

        const newSchedules = [];

        // Generate for next 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            date.setHours(0, 0, 0, 0);

            // For each shift (Pagi, Siang, Malam)
            for (const shift of shifts) {
                // Pick a random employee
                const randomEmp = employees[Math.floor(Math.random() * employees.length)];

                // Simple logic: 1 person per shift per day
                newSchedules.push({
                    employee_id: randomEmp.id,
                    shift_id: shift.id,
                    date: date
                });
            }
        }

        // Bulk insert
        await prisma.employeeSchedule.createMany({
            data: newSchedules
        });

        res.json({ message: 'Auto-Roster Generated Successfully', count: newSchedules.length });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate roster' });
    }
};

// PAYROLL ESTIMATOR: Count shifts * Rate
exports.getPayrollStats = async (req, res) => {
    try {
        const { start, end } = req.query;

        const schedules = await prisma.employeeSchedule.findMany({
            where: {
                date: {
                    gte: start ? new Date(start) : undefined,
                    lte: end ? new Date(end) : undefined
                }
            },
            include: {
                employee: true,
                shift: true
            }
        });

        // Group by Employee
        const payroll = {}; // { empId: { name, role, shiftCount, estimatedSalary } }

        const RATE_PER_SHIFT = 150000; // Mock Rate: 150rb per shift

        schedules.forEach(sch => {
            if (!payroll[sch.employee_id]) {
                payroll[sch.employee_id] = {
                    id: sch.employee.id,
                    name: sch.employee.full_name,
                    role: sch.employee.role,
                    shift_count: 0,
                    total_salary: 0
                };
            }
            payroll[sch.employee_id].shift_count++;
            payroll[sch.employee_id].total_salary += RATE_PER_SHIFT;
        });

        res.json({
            success: true,
            data: Object.values(payroll),
            meta: { rate_per_shift: RATE_PER_SHIFT }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch payroll' });
    }
};
