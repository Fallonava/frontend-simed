const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const specialties = [
    { name: 'Poli Umum', code: 'A', doctor: 'Dr. Andi Saputra' },
    { name: 'Poli Gigi', code: 'B', doctor: 'Drg. Budi Hartono' },
    { name: 'Poli Anak', code: 'C', doctor: 'Dr. Citra Lestari, Sp.A' },
    { name: 'Poli Penyakit Dalam', code: 'D', doctor: 'Dr. Dedi Kurniawan, Sp.PD' },
    { name: 'Poli Bedah', code: 'E', doctor: 'Dr. Eko Prasetyo, Sp.B' },
    { name: 'Poli Kandungan', code: 'F', doctor: 'Dr. Farah Quinn, Sp.OG' },
    { name: 'Poli Jantung', code: 'G', doctor: 'Dr. Gunawan, Sp.JP' },
    { name: 'Poli Mata', code: 'H', doctor: 'Dr. Hadi Sucipto, Sp.M' },
    { name: 'Poli THT', code: 'I', doctor: 'Dr. Indra Bekti, Sp.THT' },
    { name: 'Poli Saraf', code: 'J', doctor: 'Dr. Joko Anwar, Sp.S' },
];

const conditions = [
    { complaint: 'Demam tinggi 3 hari', triage: 3, diag: 'Fevers of unknown origin' },
    { complaint: 'Nyeri dada kiri menjalar ke lengan', triage: 1, diag: 'Acute Myocardial Infarction' },
    { complaint: 'Batuk berdahak', triage: 4, diag: 'Acute Bronchitis' },
    { complaint: 'Kecelakaan motor, lecet', triage: 3, diag: 'Multiple Abrasions' },
    { complaint: 'Kontrol post-op', triage: 5, diag: 'Post-surgical follow-up' },
    { complaint: 'Sesak napas berat', triage: 1, diag: 'Acute Respiratory Distress' },
    { complaint: 'Sakit gigi berlubang', triage: 4, diag: 'Dental Caries' },
    { complaint: 'Gatal-gatal seluruh tubuh', triage: 3, diag: 'Allergic Urticaria' },
    { complaint: 'Muntah-muntah dehidrasi', triage: 2, diag: 'Gastroenteritis' },
    { complaint: 'Check-up rutin', triage: 5, diag: 'Medical Examination' },
];

async function main() {
    console.log('🌱 Starting Full Simulation Seed...');

    // 1. Ensure Poliklinik & Doctors
    console.log('Checking Polikliniks & Doctors...');
    for (const spec of specialties) {
        let poli = await prisma.poliklinik.findFirst({ where: { name: spec.name } });
        if (!poli) {
            poli = await prisma.poliklinik.create({
                data: { name: spec.name, queue_code: spec.code }
            });
        }

        let doc = await prisma.doctor.findFirst({ where: { name: spec.doctor } });
        if (!doc) {
            doc = await prisma.doctor.create({
                data: {
                    name: spec.doctor,
                    specialist: spec.name, // Use Poliklinik name as specialist
                    poliklinik_id: poli.id
                    // status: 'AVAILABLE' // Removed (not in schema)
                }
            });
        }

        // Create Daily Quota for Today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingQuota = await prisma.dailyQuota.findFirst({
            where: { doctor_id: doc.id, date: today }
        });

        if (!existingQuota) {
            await prisma.dailyQuota.create({
                data: {
                    doctor_id: doc.id,
                    date: today,
                    max_quota: 50,
                    status: 'OPEN'
                }
            });
        }
    }

    // 2. Create 30 Diverse Patients
    console.log('Seeding Patients...');
    const patients = [];
    for (let i = 1; i <= 30; i++) {
        const isBPJS = Math.random() > 0.4;
        const patientData = {
            name: `Simulation Patient ${i}`,
            nik: `320101${String(i).padStart(6, '0')}0001`,
            no_rm: `RM${new Date().getFullYear()}${String(i).padStart(4, '0')}`,
            birth_date: new Date(1970 + Math.floor(Math.random() * 40), 0, 1),
            gender: Math.random() > 0.5 ? 'L' : 'P',
            address: `Jl. Simulasi No. ${i}, Jakarta`,
            phone: `081234567${String(i).padStart(3, '0')}`,
            bpjs_card_no: isBPJS ? `000123456${String(i).padStart(4, '0')}` : null,
            allergies: Math.random() > 0.8 ? 'Seafood, Penicillin' : null
        };

        // Check exist
        const exist = await prisma.patient.findFirst({ where: { nik: patientData.nik } });
        if (!exist) {
            const p = await prisma.patient.create({ data: patientData });
            patients.push(p);
        } else {
            patients.push(exist);
        }
    }

    // 3. Create Queues & Triage Data (For Today)
    console.log('Generating Queues & Triage...');
    const doctors = await prisma.doctor.findMany({ include: { DailyQuota: true } });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 20; i++) {
        const patient = patients[i % patients.length];
        const doctor = doctors[i % doctors.length];
        const quota = await prisma.dailyQuota.findFirst({ where: { doctor_id: doctor.id, date: today } });

        if (!quota) continue;

        // Random Status
        const rand = Math.random();
        let status = 'WAITING';
        if (rand > 0.7) status = 'SERVED';
        else if (rand > 0.5) status = 'CALLED';

        // Check if queue exists
        const existQ = await prisma.queue.findFirst({
            where: { daily_quota_id: quota.id, patient_id: patient.id }
        });

        let queue;
        if (!existQ) {
            const lastQ = await prisma.queue.count({ where: { daily_quota_id: quota.id } });
            queue = await prisma.queue.create({
                data: {
                    daily_quota_id: quota.id,
                    patient_id: patient.id,
                    queue_number: lastQ + 1,
                    queue_code: `${doctor.name.substring(0, 2).toUpperCase()}-${String(lastQ + 1).padStart(3, '0')}`,
                    status: status
                }
            });

            // Update Quota Count
            await prisma.dailyQuota.update({
                where: { id: quota.id },
                data: { current_count: { increment: 1 } }
            });
        } else {
            queue = existQ;
        }

        // 4. Create Medical Record / Triage Data
        // Condition randomization
        const cond = conditions[Math.floor(Math.random() * conditions.length)];

        const existingMR = await prisma.medicalRecord.findFirst({ where: { queue_id: queue.id } });
        if (!existingMR) {
            await prisma.medicalRecord.create({
                data: {
                    patient_id: patient.id,
                    doctor_id: doctor.id,
                    queue_id: queue.id,
                    visit_date: new Date(),
                    // Triage Data
                    triage_status: 'COMPLETED',
                    triage_level: cond.triage,
                    chief_complaint: cond.complaint,
                    // Vitals
                    systolic: 110 + Math.floor(Math.random() * 40),
                    diastolic: 70 + Math.floor(Math.random() * 20),
                    heart_rate: 60 + Math.floor(Math.random() * 40),
                    temperature: 36 + Math.random() * 1.5,
                    weight: 50 + Math.floor(Math.random() * 40),
                    height: 150 + Math.floor(Math.random() * 30),
                    // SOAP (If Served)
                    subjective: status === 'SERVED' ? cond.complaint : '',
                    objective: status === 'SERVED' ? 'Compos Mentis. General condition fair.' : '',
                    assessment: status === 'SERVED' ? cond.diag : '',
                    plan: status === 'SERVED' ? 'Prescribed medication. Rest.' : ''
                }
            });
        }
    }

    // 5. Inpatient Admission Simulation
    console.log('Admitting Inpatients...');
    const beds = await prisma.bed.findMany({ where: { status: 'AVAILABLE' }, take: 5 });
    const admitPatients = patients.slice(20, 25); // Patients 21-25

    for (let i = 0; i < beds.length; i++) {
        const bed = beds[i];
        const p = admitPatients[i];

        await prisma.bed.update({
            where: { id: bed.id },
            data: {
                status: 'OCCUPIED',
                current_patient_id: p.id,
                service_request: Math.random() > 0.5 ? 'NURSE' : null // 50% chance calling nurse
            }
        });

        await prisma.admission.create({
            data: {
                patient_id: p.id,
                bed_id: bed.id,
                status: 'ACTIVE',
                diagnosa_masuk: 'General Observation'
            }
        });
    }

    console.log('✅ Full Simulation Seed Completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
