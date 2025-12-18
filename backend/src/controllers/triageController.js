const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/triage/queue
// Mengambil pasien yang sudah check-in (punya TIKET ANTRIAN) tapi belum diperiksa dokter
// Asumsi: MedicalRecord dibuat saat check-in atau saat dipanggil triage?
// Di logika Registration.jsx create ticket, MedicalRecord belum dibuat? Cek Registration.jsx
// Registration hanya buat 'Queue' dan 'Ticket' (via endpoint /queue/ticket)
// Kita harus cek endpoint queue/ticket logic nya.
// ASUMSI: MedicalRecord dibuat saat Triage.

exports.getTriageQueue = async (req, res) => {
    try {
        // Ambil antrian yang statusnya WAITING atau CALLED, tapi belum punya Medical Record (atau Triage Status PENDING)
        // Kita join Queue dengan Patient
        const queue = await prisma.queue.findMany({
            where: {
                status: { in: ['WAITING', 'CALLED'] },
                // AND: Belum ada Medical Record untuk hari ini? Atau Triage Status null?
                // Simplifikasi: Ambil semua antrian hari ini
                daily_quota: {
                    date: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lt: new Date(new Date().setHours(23, 59, 59, 999))
                    }
                }
            },
            include: {
                patient: true,
                daily_quota: {
                    include: {
                        doctor: true
                    }
                },
                medical_records: true // Cek apakah sudah ada MR
            },
            orderBy: {
                created_at: 'asc'
            }
        });

        // Filter: Hanya tampilkan yang BELUM di-triage (MedicalRecord belum ada atau triage_status check)
        // Jika MedicalRecord belum ada, berarti perlu Triage.
        // Jika MedicalRecord ada, cek triage_status.
        const pendingTriage = queue.filter(q => {
            const hasMR = q.medical_records.length > 0;
            if (!hasMR) return true; // Belum ada MR, perlu triage
            // Jika MR ada, cek status
            return q.medical_records.some(mr => mr.triage_status === 'PENDING');
        });

        // Format data untuk frontend
        const formatted = pendingTriage.map(q => ({
            id: q.id,
            patient: q.patient,
            doctor: q.daily_quota.doctor,
            queue: q,
            medical_record_id: q.medical_records[0]?.id // Optional if exists
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch triage queue' });
    }
};

// POST /api/triage/:queueId/submit
exports.submitTriage = async (req, res) => {
    const { queueId } = req.params;
    const { vitals, allergies } = req.body;
    const { id: queueIntId } = { id: parseInt(queueId) };

    try {
        // 1. Update Allergies di tabel Patient
        const queueItem = await prisma.queue.findUnique({
            where: { id: parseInt(queueId) },
            include: { patient: true, daily_quota: true }
        });

        if (!queueItem) return res.status(404).json({ error: 'Queue not found' });

        if (allergies) {
            await prisma.patient.update({
                where: { id: queueItem.patient_id },
                data: { allergies }
            });
        }

        // 2. Buat atau Update MedicalRecord
        // Cek dulu apakah Medical Record sudah ada untuk queue ini
        const existingMR = await prisma.medicalRecord.findFirst({
            where: { queue_id: parseInt(queueId) }
        });

        let mr;
        if (existingMR) {
            mr = await prisma.medicalRecord.update({
                where: { id: existingMR.id },
                data: {
                    ...vitals, // Spread systolic, temp, etc.
                    triage_status: 'COMPLETED'
                }
            });
        } else {
            mr = await prisma.medicalRecord.create({
                data: {
                    patient_id: queueItem.patient_id,
                    doctor_id: queueItem.daily_quota.doctor_id,
                    queue_id: parseInt(queueId),
                    ...vitals,
                    triage_status: 'COMPLETED',
                    subjective: '', // Placeholder SOAP
                    objective: '',
                    assessment: '',
                    plan: ''
                }
            });
        }

        res.json({ message: 'Triage submitted', medical_record: mr });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit triage' });
    }
};
