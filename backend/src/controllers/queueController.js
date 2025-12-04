const { PrismaClient } = require('@prisma/client');

// Helper to get today's date at 00:00:00
const getToday = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

exports.generateQuota = async (req, res) => {
    const { prisma } = req;
    const today = getToday();

    try {
        const doctors = await prisma.doctor.findMany();
        const quotas = [];

        for (const doctor of doctors) {
            // Check if quota already exists
            const existing = await prisma.dailyQuota.findUnique({
                where: {
                    doctor_id_date: {
                        doctor_id: doctor.id,
                        date: today
                    }
                }
            });

            if (!existing) {
                const quota = await prisma.dailyQuota.create({
                    data: {
                        doctor_id: doctor.id,
                        date: today,
                        max_quota: 30, // Default quota
                        status: 'OPEN'
                    }
                });
                quotas.push(quota);
            }
        }

        res.json({ message: 'Quotas generated', count: quotas.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate quotas' });
    }
};

exports.toggleStatus = async (req, res) => {
    const { prisma, io } = req;
    const { doctor_id, status, max_quota } = req.body;
    const today = getToday();

    try {
        const updatedQuota = await prisma.dailyQuota.update({
            where: {
                doctor_id_date: {
                    doctor_id: parseInt(doctor_id),
                    date: today
                }
            },
            data: {
                status: status,
                max_quota: max_quota ? parseInt(max_quota) : undefined
            },
            include: {
                doctor: true
            }
        });

        io.emit('status_update', updatedQuota);
        res.json(updatedQuota);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

exports.takeTicket = async (req, res) => {
    const { prisma, io } = req;
    const { doctor_id } = req.body;
    const today = getToday();

    try {
        // Transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            const quota = await tx.dailyQuota.findUnique({
                where: {
                    doctor_id_date: {
                        doctor_id: parseInt(doctor_id),
                        date: today
                    }
                },
                include: { doctor: true }
            });

            if (!quota) throw new Error('Doctor not available today');
            if (quota.status !== 'OPEN') throw new Error('Queue is closed');
            if (quota.current_count >= quota.max_quota) throw new Error('Quota full');

            const newCount = quota.current_count + 1;

            // Update quota count
            const updatedQuota = await tx.dailyQuota.update({
                where: { id: quota.id },
                data: { current_count: newCount }
            });

            // Create Queue Ticket
            const ticket = await tx.queue.create({
                data: {
                    daily_quota_id: quota.id,
                    queue_number: newCount,
                    queue_code: `${quota.doctor.poli_name.substring(0, 3).toUpperCase()}-${String(newCount).padStart(3, '0')}`,
                    status: 'WAITING'
                }
            });

            return { ticket, updatedQuota, doctor: quota.doctor };
        });

        io.emit('queue_update', result);
        // Also emit status update to refresh counters on dashboard/kiosk
        io.emit('status_update', { ...result.updatedQuota, doctor: result.doctor });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

exports.callNext = async (req, res) => {
    const { prisma, io } = req;
    const { doctor_id } = req.body;
    const today = getToday();

    try {
        const result = await prisma.$transaction(async (tx) => {
            const quota = await tx.dailyQuota.findUnique({
                where: {
                    doctor_id_date: {
                        doctor_id: parseInt(doctor_id),
                        date: today
                    }
                },
                include: { doctor: true }
            });

            if (!quota) throw new Error('Doctor not available today');

            // Find currently called ticket and mark as served
            const currentTicket = await tx.queue.findFirst({
                where: {
                    daily_quota_id: quota.id,
                    status: 'CALLED'
                }
            });

            if (currentTicket) {
                await tx.queue.update({
                    where: { id: currentTicket.id },
                    data: { status: 'SERVED' }
                });
            }

            // Find next waiting ticket
            const nextTicket = await tx.queue.findFirst({
                where: {
                    daily_quota_id: quota.id,
                    status: 'WAITING'
                },
                orderBy: { queue_number: 'asc' }
            });

            if (!nextTicket) {
                return { message: 'No more patients in queue', quota };
            }

            // Mark next ticket as called
            const updatedTicket = await tx.queue.update({
                where: { id: nextTicket.id },
                data: { status: 'CALLED' }
            });

            return { ticket: updatedTicket, doctor: quota.doctor, quota };
        });

        if (result.ticket) {
            io.emit('call_patient', result);
            // Also emit status update to keep counts in sync if we track served counts later
            // io.emit('status_update', { ...result.quota, doctor: result.doctor }); 
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to call next patient' });
    }
};

exports.getDoctors = async (req, res) => {
    const { prisma } = req;
    const today = getToday();

    try {
        // Fetch doctors with their today's quota
        const doctors = await prisma.doctor.findMany({
            include: {
                DailyQuota: {
                    where: { date: today }
                }
            }
        });

        // Transform data to flatten the structure for frontend convenience
        const data = doctors.map(doc => ({
            ...doc,
            quota: doc.DailyQuota[0] || null
        }));

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
};
