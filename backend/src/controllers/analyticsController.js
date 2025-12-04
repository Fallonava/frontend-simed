const { PrismaClient } = require('@prisma/client');

// Helper to get today's date at 00:00:00
const getToday = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

exports.getDailyStats = async (req, res) => {
    const { prisma } = req;
    const today = getToday();

    try {
        // 1. Total Patients Today
        const totalPatients = await prisma.queue.count({
            where: {
                daily_quota: {
                    date: today
                }
            }
        });

        // 2. Patients per Poliklinik (Pie Chart)
        // We need to group by Poliklinik. Prisma doesn't support deep relation grouping easily,
        // so we'll fetch all today's queues with relations and aggregate in JS or use raw query.
        // For simplicity and small scale, fetching and aggregating in JS is fine.
        const queues = await prisma.queue.findMany({
            where: {
                daily_quota: {
                    date: today
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
        })).filter(d => d.patients > 0); // Optional: filter empty hours or keep them

        res.json({
            totalPatients,
            pieChartData,
            barChartData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};
