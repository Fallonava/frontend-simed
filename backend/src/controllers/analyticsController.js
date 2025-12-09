const { PrismaClient } = require('@prisma/client');

// Helper to get target date at 00:00:00
const getTargetDate = (queryDate) => {
    const date = queryDate ? new Date(queryDate) : new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

exports.getDailyStats = async (req, res) => {
    const { prisma } = req;
    const targetDate = getTargetDate(req.query.date);

    try {
        // 1. Total Patients
        const totalPatients = await prisma.queue.count({
            where: {
                daily_quota: {
                    date: targetDate
                }
            }
        });

        // 2. Patients per Poliklinik (Pie Chart)
        const queues = await prisma.queue.findMany({
            where: {
                daily_quota: {
                    date: targetDate
                }
            },
            include: {
                daily_quota: {
                    include: {
                        doctor: {
                            include: { poliklinik: true }
                        }
                    }
                }
            }
        });

        const poliStats = {};
        queues.forEach(q => {
            const poliName = q.daily_quota.doctor.poliklinik.name;
            poliStats[poliName] = (poliStats[poliName] || 0) + 1;
        });

        const pieChartData = Object.keys(poliStats).map(name => ({
            name,
            value: poliStats[name]
        }));

        // 3. Hourly Patient Arrival (Bar Chart)
        const hourlyStats = Array(24).fill(0);
        queues.forEach(q => {
            const hour = new Date(q.created_at).getHours();
            hourlyStats[hour]++;
        });

        const barChartData = hourlyStats.map((count, hour) => ({
            hour: `${String(hour).padStart(2, '0')}:00`,
            patients: count
        })).filter(d => d.patients > 0);

        // 4. Queue Status Distribution (Doughnut Chart)
        const statusCounts = { WAITING: 0, CALLED: 0, SERVED: 0, SKIPPED: 0 };
        queues.forEach(q => {
            if (statusCounts[q.status] !== undefined) {
                statusCounts[q.status]++;
            }
        });

        const queueStatusData = [
            { name: 'Waiting', value: statusCounts.WAITING },
            { name: 'Called', value: statusCounts.CALLED },
            { name: 'Served', value: statusCounts.SERVED },
            { name: 'Skipped', value: statusCounts.SKIPPED }
        ].filter(d => d.value > 0);

        res.json({
            totalPatients,
            pieChartData,
            barChartData,
            queueStatusData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};
