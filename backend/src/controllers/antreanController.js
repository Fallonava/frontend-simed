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

    // NOTE: This assumes 'kodepoli' is mapped to a doctor ID in our system for simplicity, 
    // or we pick the first available doctor in that Poli.
    // For DEMO: We expect 'kodepoli' to actually be our 'doctor_id' (hack for simplicity) or we find doctor by poli.

    try {
        const today = getToday();

        // 1. Find or Create Patient (by NIK)
        let patient = await prisma.patient.findFirst({ where: { nik: nik } });
        if (!patient) {
            // Auto-register partial patient
            patient = await prisma.patient.create({
                data: {
                    nik,
                    name: `Pasien JKN ${nomorkartu}`,
                    no_rm: `RM-JKN-${Date.now().toString().slice(-4)}`,
                    birth_date: new Date('1990-01-01'), // Default
                    gender: 'L'
                }
            });
        }

        // 2. Find Quota (Assume 'kodepoli' matches Doctor ID for this MVP, usually mapped)
        // Let's try to map: If kodepoli is digit, allow.
        let doctorId = parseInt(kodepoli);
        if (isNaN(doctorId)) {
            // Find first doctor
            const doc = await prisma.doctor.findFirst();
            doctorId = doc.id;
        }

        let dailyQuota = await prisma.dailyQuota.findFirst({
            where: { doctor_id: doctorId, date: today }
        });

        if (!dailyQuota) {
            // Auto create
            dailyQuota = await prisma.dailyQuota.create({
                data: { doctor_id: doctorId, date: today, max_quota: 50, status: 'OPEN' }
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
                booking_code: `BOOK-${Date.now()}`, // Unique BPJS Booking ID
                booked_via: 'MOBILE_JKN',
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
        return res.status(500).json({ metadata: { message: "Gagal Booking", code: 500 } });
    }
};
