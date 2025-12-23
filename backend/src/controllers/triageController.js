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
                        gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days for testing
                        lt: new Date(new Date().setHours(23, 59, 59, 999))
                    }
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
                },
                medical_records: true // Cek apakah sudah ada MR
            },
            orderBy: {
                created_at: 'asc'
            }
        });

        console.log(`[DEBUG] Triage Queue Found: ${queue.length} items`);
        console.log(`[DEBUG] Date Filter: ${new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()}`);

        // REMOVED FILTER: We want to show ALL waiting patients, even if triage is done.
        // The Frontend will decide whether to show "Needs Triage" or "Waiting for Doctor"

        // const pendingTriage = queue.filter(q => {
        //     const hasMR = q.medical_records.length > 0;
        //     if (!hasMR) return true; // Belum ada MR, perlu triage
        //     // Jika MR ada, cek status
        //     return q.medical_records.some(mr => mr.triage_status === 'PENDING');
        // });

        // Use full queue
        const visibleQueue = queue;

        // Format data untuk frontend
        const formatted = visibleQueue.map(q => {
            const mr = q.medical_records[0]; // Recent MR
            return {
                id: q.id,
                patient: q.patient,
                doctor: q.daily_quota.doctor,
                poliklinik: q.daily_quota.doctor.poliklinik,
                queue: q,
                medical_record_id: mr?.id,
                triage_status: mr?.triage_status || 'PENDING', // Derived status (PENDING if no MR)
                vitals: mr ? { // Map vitals if exist
                    systolic: mr.systolic,
                    diastolic: mr.diastolic,
                    heart_rate: mr.heart_rate,
                    temperature: mr.temperature,
                    weight: mr.weight,
                    height: mr.height,
                    triage_level: mr.triage_level,
                    chief_complaint: mr.chief_complaint,
                    allergies: q.patient.allergies // Use patient allergies as source of truth
                } : null
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch triage queue' });
    }
};

// POST /api/triage/:queueId/submit
exports.submitTriage = async (req, res) => {
    const { queueId } = req.params;
    const { vitals, allergies, triage_level, chief_complaint } = req.body;
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
        const existingMR = await prisma.medicalRecord.findFirst({
            where: { queue_id: parseInt(queueId) }
        });

        // Filter valid vitals for Schema
        const { systolic, diastolic, heart_rate, temperature, weight, height, respiratory_rate, oxygen_saturation } = vitals || {};

        let extraNotes = '';
        if (respiratory_rate) extraNotes += `RR: ${respiratory_rate} x/m. `;
        if (oxygen_saturation) extraNotes += `SpO2: ${oxygen_saturation}%. `;

        let mr;
        if (existingMR) {
            mr = await prisma.medicalRecord.update({
                where: { id: existingMR.id },
                data: {
                    systolic: systolic ? parseInt(systolic) : undefined,
                    diastolic: diastolic ? parseInt(diastolic) : undefined,
                    heart_rate: heart_rate ? parseInt(heart_rate) : undefined,
                    temperature: temperature ? parseFloat(temperature) : undefined,
                    weight: weight ? parseFloat(weight) : undefined,
                    height: height ? parseFloat(height) : undefined,
                    triage_level: parseInt(triage_level),
                    chief_complaint: chief_complaint,
                    triage_status: 'COMPLETED',
                    objective: (existingMR.objective || '') + (extraNotes ? '\n[Triage] ' + extraNotes : '')
                }
            });
        } else {
            mr = await prisma.medicalRecord.create({
                data: {
                    patient_id: queueItem.patient_id,
                    doctor_id: queueItem.daily_quota.doctor_id,
                    queue_id: parseInt(queueId),
                    systolic: systolic ? parseInt(systolic) : undefined,
                    diastolic: diastolic ? parseInt(diastolic) : undefined,
                    heart_rate: heart_rate ? parseInt(heart_rate) : undefined,
                    temperature: temperature ? parseFloat(temperature) : undefined,
                    weight: weight ? parseFloat(weight) : undefined,
                    height: height ? parseFloat(height) : undefined,
                    triage_level: parseInt(triage_level),
                    chief_complaint: chief_complaint,
                    triage_status: 'COMPLETED',
                    subjective: '', // Placeholder SOAP
                    objective: extraNotes ? '[Triage] ' + extraNotes : '',
                    assessment: '',
                    plan: ''
                }
            });
        }

        // SOCKET EMIT
        req.io.emit('queue_update', { type: 'TRIAGE_SUBMIT', queueId, patientName: queueItem.patient.name });

        res.json({ message: 'Triage submitted', medical_record: mr });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit triage' });
    }
};
