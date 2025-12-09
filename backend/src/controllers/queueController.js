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
        const updatedQuota = await prisma.dailyQuota.upsert({
            where: {
                doctor_id_date: {
                    doctor_id: parseInt(doctor_id),
                    date: today
                }
            },
            update: {
                status: status,
                max_quota: max_quota ? parseInt(max_quota) : undefined
            },
            create: {
                doctor_id: parseInt(doctor_id),
                date: today,
                status: status,
                max_quota: max_quota ? parseInt(max_quota) : 30 // Default if not provided
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
                include: {
                    doctor: {
                        include: { poliklinik: true }
                    }
                }
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
                    queue_code: `${quota.doctor.poliklinik.queue_code}-${String(newCount).padStart(3, '0')}`,
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

exports.getWaiting = async (req, res) => {
    const { prisma } = req;
    const { poli_id } = req.query;
    const today = getToday();

    try {
        const whereClause = {
            status: 'WAITING',
            daily_quota: {
                date: today
            }
        };

        if (poli_id && poli_id !== 'all') {
            whereClause.daily_quota.doctor = {
                poliklinik_id: parseInt(poli_id)
            };
        }

        const queues = await prisma.queue.findMany({
            where: whereClause,
            include: {
                daily_quota: {
                    include: {
                        doctor: {
                            include: { poliklinik: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'asc' }
        });

        res.json(queues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch waiting queues' });
    }
};

exports.callNext = async (req, res) => {
    const { prisma, io } = req;
    const { counter_name, poli_id } = req.body; // poli_id is optional filter
    const today = getToday();

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Build filter for next ticket
            const whereClause = {
                status: 'WAITING',
                daily_quota: {
                    date: today
                }
            };

            if (poli_id && poli_id !== 'all') {
                whereClause.daily_quota.doctor = {
                    poliklinik_id: parseInt(poli_id)
                };
            }

            // Find next waiting ticket
            const nextTicket = await tx.queue.findFirst({
                where: whereClause,
                orderBy: { created_at: 'asc' }, // FIFO
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

            if (!nextTicket) {
                return null;
            }

            // Mark ticket as called
            const updatedTicket = await tx.queue.update({
                where: { id: nextTicket.id },
                data: { status: 'CALLED' }
            });

            return {
                ticket: updatedTicket,
                doctor: nextTicket.daily_quota.doctor,
                poliklinik: nextTicket.daily_quota.doctor.poliklinik
            };
        });

        if (!result) {
            return res.status(404).json({ message: 'No more patients in queue' });
        }

        // Emit event for TV and other clients
        io.emit('call_patient', {
            ticket: result.ticket,
            counter_name: counter_name,
            poli_name: result.poliklinik.name
        });

        // Also emit status update to refresh lists
        io.emit('queue_update');

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to call next patient' });
    }
};

exports.completeTicket = async (req, res) => {
    const { prisma, io } = req;
    const { ticket_id } = req.body;

    try {
        const ticket = await prisma.queue.update({
            where: { id: parseInt(ticket_id) },
            data: { status: 'SERVED' }
        });

        io.emit('queue_update');
        res.json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to complete ticket' });
    }
};

exports.skipTicket = async (req, res) => {
    const { prisma, io } = req;
    const { ticket_id } = req.body;

    try {
        const ticket = await prisma.queue.update({
            where: { id: parseInt(ticket_id) },
            data: { status: 'SKIPPED' }
        });

        io.emit('queue_update');
        res.json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to skip ticket' });
    }
};

exports.getSkipped = async (req, res) => {
    const { prisma } = req;
    const { poli_id } = req.query;
    const today = getToday();

    try {
        const whereClause = {
            status: 'SKIPPED',
            daily_quota: {
                date: today
            }
        };

        if (poli_id && poli_id !== 'all') {
            whereClause.daily_quota.doctor = {
                poliklinik_id: parseInt(poli_id)
            };
        }

        const queues = await prisma.queue.findMany({
            where: whereClause,
            include: {
                daily_quota: {
                    include: {
                        doctor: {
                            include: { poliklinik: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'asc' }
        });

        res.json(queues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch skipped queues' });
    }
};

exports.recallSkipped = async (req, res) => {
    const { prisma, io } = req;
    const { ticket_id, counter_name } = req.body;

    try {
        const ticket = await prisma.queue.findUnique({
            where: { id: parseInt(ticket_id) },
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

        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        // Update status to CALLED
        const updatedTicket = await prisma.queue.update({
            where: { id: parseInt(ticket_id) },
            data: { status: 'CALLED' }
        });

        // Emit event
        io.emit('call_patient', {
            ticket: updatedTicket,
            counter_name: counter_name,
            poli_name: ticket.daily_quota.doctor.poliklinik.name
        });

        io.emit('queue_update');
        res.json(updatedTicket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to recall ticket' });
    }
};

exports.getDoctors = async (req, res) => {
    const { prisma } = req;
    const today = getToday();
    // ... existing code ...

    try {
        // Fetch doctors with their today's quota
        const doctors = await prisma.doctor.findMany({
            include: {
                poliklinik: true,
                schedules: true,
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

exports.getTicket = async (req, res) => {
    const { prisma } = req;
    const { id } = req.params;

    try {
        const ticket = await prisma.queue.findUnique({
            where: { id: parseInt(id) },
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

        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        // Calculate queue ahead
        const aheadCount = await prisma.queue.count({
            where: {
                daily_quota_id: ticket.daily_quota_id,
                status: 'WAITING',
                queue_number: {
                    lt: ticket.queue_number
                }
            }
        });

        res.json({ ticket, aheadCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch ticket' });
    }
};
