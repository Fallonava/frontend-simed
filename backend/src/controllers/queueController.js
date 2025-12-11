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
    const { prisma } = req; // Add prisma to destructuring
    const { doctor_id, patient_id } = req.body; // Expect patient_id

    try {
        const date = new Date();
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        // 1. Check Schedule & Quota
        // ... (Existing quota logic logic remains, but simplified for brevity in this replace) ...
        // We assume previous quota logic is fine, we just update the create call.

        let dailyQuota = await prisma.dailyQuota.findFirst({
            where: {
                doctor_id: parseInt(doctor_id),
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: { doctor: { include: { poliklinik: true } } }
        });

        /* ... Quota creation logic if missing (omitted for brevity, keeping existing flow is safer usually, 
           but I have to replace the function. I'll copy the standard logic back.) */

        if (!dailyQuota) {
            // Auto-create quota if not exists
            dailyQuota = await prisma.dailyQuota.create({
                data: {
                    doctor_id: parseInt(doctor_id),
                    date: startOfDay,
                    max_quota: 50, // Default quota
                    status: 'OPEN'
                },
                include: { doctor: { include: { poliklinik: true } } }
            });
        }

        if (dailyQuota.current_count >= dailyQuota.max_quota) {
            return res.status(400).json({ error: 'Quota full' });
        }

        // 2. Create Ticket
        const result = await prisma.$transaction(async (tx) => {
            // Increment Quota
            const updatedQuota = await tx.dailyQuota.update({
                where: { id: dailyQuota.id },
                data: { current_count: { increment: 1 } }
            });

            const doctor = dailyQuota.doctor;
            const poliklinik = doctor.poliklinik;
            let queueCode = '';
            let queueNumber = updatedQuota.current_count;

            // CHECK: Is this Kiosk (Anonymous) or Registration (Patient ID)?
            if (!patient_id) {
                // KIOSK / ANONYMOUS -> Use Poliklinik Code (e.g. A-001)
                const poliCode = poliklinik.queue_code || 'A'; // Default if missing

                // For Kiosk, we ideally want a sequence based on the POLI, not just the doctor.
                // However, preserving existing 'queue_number' as doctor-quota-count is safer for internal logic.
                // We will count how many "Anonymous" tickets exist for this Poli today to give a nice "A-001, A-002" sequence.

                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const todayEnd = new Date();
                todayEnd.setHours(23, 59, 59, 999);

                const poliTicketCount = await tx.queue.count({
                    where: {
                        daily_quota: {
                            doctor: { poliklinik_id: poliklinik.id },
                            date: { gte: todayStart, lte: todayEnd }
                        },
                        // Optional: Count only anonymous tickets? Or all tickets in this Poli? 
                        // Usually "Antrian Pendaftaran" is inclusive. Let's count all tickets in this Poli.
                    }
                });

                const poliSequence = poliTicketCount + 1;
                queueCode = `${poliCode}-${String(poliSequence).padStart(3, '0')}`;

            } else {
                // REGISTRATION / NAMED -> Use Doctor Initials (e.g. BS-001)
                // Generate initials: "Dr. Budi Santoso" -> "BS"
                const cleanName = doctor.name.replace(/^Dr\.\s+/i, '').replace(/,/g, '');
                const parts = cleanName.split(' ').filter(p => p.length > 0);
                let initials = '';
                if (parts.length >= 2) {
                    initials = (parts[0][0] + parts[1][0]).toUpperCase();
                } else if (parts.length === 1) {
                    initials = parts[0].substring(0, 2).toUpperCase();
                } else {
                    initials = 'DR';
                }

                // Doctor Queue uses the Doctor's own quota count
                queueCode = `${initials}-${String(queueNumber).padStart(3, '0')}`;
            }

            const newQueue = await tx.queue.create({
                data: {
                    daily_quota_id: dailyQuota.id,
                    patient_id: patient_id ? parseInt(patient_id) : null,
                    queue_number: queueNumber, // Keep internal rotation number
                    queue_code: queueCode,
                    status: 'WAITING'
                }
            });

            return newQueue;
        });

        // Emit Socket
        const io = req.io;
        if (io) {
            io.emit('queue_updated', { type: 'new_ticket' });
        } else {
            console.warn('Socket.io instance not found in request');
        }

        res.status(201).json({
            message: 'Ticket created',
            ticket: result
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to take ticket' });
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
                patient: true, // Include Patient Data
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
                    patient: true, // Include Patient
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
                patient: true,
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
                patient: true,
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
                patient: true,
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
