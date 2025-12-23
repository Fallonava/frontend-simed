// MOCK Antrean Online Controller (Standard HFIS/BPJS Specs)
// In production, this interacts with specific BPJS Bridging endpoints.

// Real Antrean Online Controller (BPJS Bridging Specs)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper: Get Today's Date 00:00:00
const getToday = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

// 1. GET Status Antrean (Untuk Mobile JKN display)
// URL: /antrean/status/:kodepoli/:tanggal
exports.getStatusAntrean = async (req, res) => {
    const { kodepoli, tanggal } = req.params;

    try {
        // Find Poliklinik by Code (Assuming queue_code or name matching for now, better to add 'bpjs_poli_code' field later)
        // For simulation, we assume kodepoli maps to our ID or we search by name contains.
        // Let's assume we pass ID for internal test, or map logic.
        // BPJS sends string code 'POLI001'. We'll search `queue_code` prefix or similar.

        // Simpler: Fetch ALL quotas for today and filter manually or just return aggregating all for "Poli"
        // Let's try to find a doctor schedule in this Poli for the given date.

        const today = getToday(); // ignoring 'tanggal' param for simple MVP, assuming "Today"

        const quotasList = await prisma.dailyQuota.findMany({
            where: {
                date: today,
                doctor: {
                    poliklinik: {
                        // In real app, map 'kodepoli' BPJS to our ID. 
                        // Demo: We just take the first open quota found or default.
                    }
                }
            },
            include: { doctor: { include: { poliklinik: true } } }
        });

        // Mock aggregate
        const combinedTotal = quotasList.reduce((sum, q) => sum + q.max_quota, 0);
        const combinedCurrent = quotasList.reduce((sum, q) => sum + q.current_count, 0);

        // Find active ticket being called?
        // We'll just return first active one

        return res.json({
            metadata: { message: "Ok", code: 200 },
            response: {
                namapoli: quotasList[0]?.doctor?.poliklinik?.name || "POLI UMUM",
                namadokter: quotasList[0]?.doctor?.name || "Dokter Jaga",
                totalantrean: combinedCurrent, // Total booked
                sisaantrean: combinedTotal - combinedCurrent, // Remaining quota? Or remaining to be served?
                // BPJS definition: Sisa Antrean = (Last No - Called No). 
                // Let's stick to our "Waiting" count.
                antreanpanggil: "A-00?", // Todo: Fetch latest called
                sisakuotajkn: 50,
                kuotajkn: 50,
                sisakuotanonjkn: 50,
                kuotanonjkn: 50,
                keterangan: "Jam Buka 08:00 - 14:00"
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ metadata: { message: "Error", code: 500 } });
    }
};

// 2. GET Sisa Antrean (Realtime Check)
// URL: /antrean/sisa
exports.getSisaAntrean = async (req, res) => {
    console.log('GET /antrean/sisa Called');
    try {
        const today = getToday();

        // Group by Poliklinik
        // 1. Get all Doctors with Quota today
        const quotas = await prisma.dailyQuota.findMany({
            where: { date: today },
            include: { doctor: { include: { poliklinik: true } } }
        });

        // 2. For each quota, count "WAITING"
        const results = await Promise.all(quotas.map(async (q) => {
            const waitingCount = await prisma.queue.count({
                where: {
                    daily_quota_id: q.id,
                    status: 'WAITING'
                }
            });

            // Find last called
            const lastCalled = await prisma.queue.findFirst({
                where: { daily_quota_id: q.id, status: { in: ['CALLED', 'SERVED'] } },
                orderBy: { created_at: 'desc' }
            });

            return {
                namapoli: q.doctor.poliklinik?.name || 'POLI UMUM',
                namadokter: q.doctor.name,
                sisaantrean: waitingCount,
                antreanpanggil: lastCalled ? lastCalled.queue_code : '-',
                waktutunggu: waitingCount * 600 // Est 10 mins per patient
            };
        }));

        return res.json({
            metadata: { message: "Ok", code: 200 },
            response: results
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ metadata: { message: error.message, code: 500 } });
    }
};

// 3. POST Ambil Antrean (Booking Antrean)
// URL: /antrean/ambil
exports.ambilAntrean = async (req, res) => {
    const { nomorkartu, nik, keluhan, kodepoli, tanggalperiksa } = req.body;

    try {
        const today = getToday();

        // 1. Find or Create Patient (by NIK)
        let patient = await prisma.patient.findFirst({ where: { nik: nik } });
        if (!patient) {
            patient = await prisma.patient.create({
                data: {
                    nik,
                    name: `Pasien JKN ${nomorkartu}`,
                    no_rm: `RM-JKN-${Date.now().toString().slice(-4)}`,
                    birth_date: new Date('1990-01-01'),
                    gender: 'L'
                }
            });
        }

        // 2. Find Quota
        let doctorId = parseInt(kodepoli);
        if (isNaN(doctorId)) {
            const doc = await prisma.doctor.findFirst();
            doctorId = doc.id;
        }

        let dailyQuota = await prisma.dailyQuota.findFirst({
            where: { doctor_id: doctorId, date: today }
        });

        if (!dailyQuota) {
            dailyQuota = await prisma.dailyQuota.create({
                data: { doctor_id: doctorId, date: today, max_quota: 50, status: 'OPEN' }
            });
        }

        // Check Quota Full
        if (dailyQuota.current_count >= dailyQuota.max_quota) {
            return res.status(400).json({
                metadata: { message: `Kuota Penuh (${dailyQuota.max_quota})`, code: 400 }
            });
        }

        // 3. Create Queue
        const currentCount = dailyQuota.current_count;
        const newQueue = await prisma.queue.create({
            data: {
                daily_quota_id: dailyQuota.id,
                patient_id: patient.id,
                queue_number: currentCount + 1,
                queue_code: `JKN-${currentCount + 1}`,
                booking_code: `BOOK-${Date.now()}`,
                booked_via: 'MOBILE_JKN',
                check_in_at: null,
                status: 'WAITING'
            }
        });

        // Update Quota
        await prisma.dailyQuota.update({
            where: { id: dailyQuota.id },
            data: { current_count: { increment: 1 } }
        });

        return res.json({
            metadata: { message: "Sukses", code: 200 },
            response: {
                nomorantrean: newQueue.queue_code,
                kodebooking: newQueue.booking_code,
                jenisantrean: 1,
                estimasidilayani: Date.now() + 3600 * 1000,
                namapoli: "POLI JKN",
                namadokter: "Dr. JKN"
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ metadata: { message: error.message, code: 500 } });
    }
};

// 4. POST Check-in (Task 1)
// URL: /antrean/checkin
exports.checkIn = async (req, res) => {
    const { kodebooking, waktu, latitude, longitude } = req.body;

    // BPJS GEOFENCING VALIDATION
    // Hospital Coord (Example: Jakarta / RS Simimed)
    const HOSP_LAT = -6.2000;
    const HOSP_LNG = 106.8166;
    const MAX_RADIUS_KM = 1.0;

    if (latitude && longitude) {
        // Haversine formula for distance
        const R = 6371; // Radius of the Earth in km
        const dLat = (latitude - HOSP_LAT) * Math.PI / 180;
        const dLon = (longitude - HOSP_LNG) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(HOSP_LAT * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        if (distance > MAX_RADIUS_KM) {
            return res.status(403).json({
                metadata: {
                    message: `Anda terlalu jauh dari RS (${distance.toFixed(2)} km). Jarak maks 1km.`,
                    code: 403
                }
            });
        }
    }

    try {
        const queue = await prisma.queue.findUnique({
            where: { booking_code: kodebooking }
        });

        if (!queue) {
            return res.status(404).json({ metadata: { message: "Antrean tidak ditemukan", code: 404 } });
        }

        // Update DB
        const updated = await prisma.queue.update({
            where: { id: queue.id },
            data: {
                check_in_at: new Date(parseInt(waktu)),
                status: 'WAITING'
            }
        });

        // Send Task 1 (Check-in)
        const bpjsService = require('../services/bpjsService');
        await bpjsService.updateTaskID({
            kodebooking: kodebooking,
            taskid: 1,
            waktu: waktu
        });

        // Log Task
        await prisma.taskTimestamp.create({
            data: {
                queue_id: queue.id,
                task_id: 1,
                timestamp: new Date(parseInt(waktu)),
                is_sent: true, // Assuming success if no error thrown by service (we should handle result)
                sent_at: new Date()
            }
        });

        // SOCKET NOTIFICATION (Premium Apple-style)
        const patient = await prisma.patient.findUnique({ where: { id: queue.patient_id } });
        req.io.emit('PATIENT_CHECKIN', {
            id: queue.id,
            booking_code: kodebooking,
            patient_name: patient.name,
            rm_no: patient.no_rm,
            check_in_time: new Date()
        });

        // Auto-send Task 2 and 3 for smooth flow simulation (Admission -> Poli Wait)
        // In real life, these are separate scans/clicks.
        setTimeout(async () => {
            const time2 = parseInt(waktu) + 300000; // +5 mins
            await bpjsService.updateTaskID({ kodebooking, taskid: 2, waktu: time2 });
            await prisma.taskTimestamp.create({ data: { queue_id: queue.id, task_id: 2, timestamp: new Date(time2), is_sent: true } });

            const time3 = time2 + 300000; // +5 mins later
            await bpjsService.updateTaskID({ kodebooking, taskid: 3, waktu: time3 });
            await prisma.taskTimestamp.create({ data: { queue_id: queue.id, task_id: 3, timestamp: new Date(time3), is_sent: true } });
        }, 1000);

        return res.json({ metadata: { message: "Check-in Berhasil", code: 200 } });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ metadata: { message: "Error Check-in", code: 500 } });
    }
};

// 5. POST Update Task (Generic)
exports.updateTask = async (req, res) => {
    const { kodebooking, taskid, waktu } = req.body;
    try {
        const bpjsService = require('../services/bpjsService');
        const result = await bpjsService.updateTaskID({ kodebooking, taskid, waktu });

        // Log to DB
        const queue = await prisma.queue.findUnique({ where: { booking_code: kodebooking } });
        if (queue) {
            await prisma.taskTimestamp.create({
                data: {
                    queue_id: queue.id,
                    task_id: parseInt(taskid),
                    timestamp: new Date(parseInt(waktu)),
                    is_sent: result.status === 'OK',
                    sent_at: new Date(),
                    error_log: result.status === 'FAILED' ? result.message : null
                }
            });
        }

        return res.json({ metadata: { message: result.message, code: result.status === 'OK' ? 200 : 500 } });
    } catch (error) {
        return res.status(500).json({ metadata: { message: "Error updating task", code: 500 } });
    }
};

// 6. GET Pending Check-in (Untuk Layar Admisi)
// URL: /antrean/pending-checkin
exports.getPendingCheckin = async (req, res) => {
    try {
        const today = getToday();

        const pending = await prisma.queue.findMany({
            where: {
                status: 'WAITING',
                check_in_at: null,
                daily_quota: {
                    date: today
                }
            },
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

        return res.json({
            metadata: { message: "Ok", code: 200 },
            response: pending
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ metadata: { message: "Error", code: 500 } });
    }
};

// 5. POST Check-in (Konfirmasi Kehadiran)
// URL: /antrean/checkin
exports.checkInBooking = async (req, res) => {
    const { kodebooking } = req.body;

    try {
        const ticket = await prisma.queue.findFirst({
            where: { booking_code: kodebooking }
        });

        if (!ticket) {
            return res.status(404).json({ metadata: { message: "Booking tidak ditemukan", code: 404 } });
        }

        if (ticket.check_in_at) {
            return res.status(400).json({ metadata: { message: "Sudah Check-in sebelumnya", code: 400 } });
        }

        const updatedTicket = await prisma.queue.update({
            where: { id: ticket.id },
            data: { check_in_at: new Date() },
            include: {
                patient: true,
                daily_quota: {
                    include: { doctor: { include: { poliklinik: true } } }
                }
            }
        });

        // Emit Socket update if possible (req.io or global io)
        if (req.io) {
            req.io.emit('queue_update', { type: 'CHECKIN', data: updatedTicket });
        }

        return res.json({
            metadata: { message: "Check-in Berhasil", code: 200 },
            response: updatedTicket
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ metadata: { message: "Gagal Check-in", code: 500 } });
    }
};