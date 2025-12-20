const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyRJFlow() {
    console.log("=== Verifying Outpatient (RJ) Workflow ===");

    try {
        // 1. Setup: Patient & Doctor
        console.log("1. Setting up Test Data...");

        // Find or create Poli Umum
        let poli = await prisma.poliklinik.findFirst({ where: { name: { contains: 'Umum' } } });
        if (!poli) poli = await prisma.poliklinik.create({ data: { name: 'Poli Umum', code: 'UMUM' } });

        // Find or create Doctor
        let doctor = await prisma.doctor.findFirst({ where: { poliklinik_id: poli.id } });
        if (!doctor) {
            doctor = await prisma.doctor.create({
                data: {
                    name: 'Dr. Verifikasi RJ',
                    sip: '123-TEST-SIP',
                    poliklinik_id: poli.id
                }
            });
        }

        // Create Patient
        const patient = await prisma.patient.create({
            data: {
                name: `Test RJ Patient ${Date.now()}`,
                nik: `3201${Date.now().toString().slice(-12)}`,
                no_rm: `RM-RJ-${Date.now().toString().slice(-4)}`,
                birth_date: new Date('1990-01-01'),
                gender: 'L',
                address: 'Test Address'
            }
        });
        console.log(`   Patient Created: ${patient.name} (${patient.no_rm})`);

        // 2. Registration (Queue)
        console.log("2. Simulating Registration (Queue)...");

        // Ensure Quota
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let quota = await prisma.dailyQuota.findFirst({
            where: { doctor_id: doctor.id, date: today }
        });
        if (!quota) {
            quota = await prisma.dailyQuota.create({
                data: { doctor_id: doctor.id, date: today, max_quota: 20, status: 'OPEN' }
            });
        }

        // Create Queue
        const queue = await prisma.queue.create({
            data: {
                daily_quota_id: quota.id,
                patient_id: patient.id,
                queue_number: quota.current_count + 1,
                queue_code: `A-${quota.current_count + 1}`,
                status: 'WAITING'
            }
        });
        console.log(`   Queue Created: ${queue.queue_code} (Status: ${queue.status})`);

        // 3. Nurse Station (Triage)
        console.log("3. Simulating Nurse Triage...");

        // Nurse fetches queue (simulated)
        const triageQueue = await prisma.queue.findUnique({
            where: { id: queue.id },
            include: { medical_records: true }
        });

        // Submit Triage (Creates Medical Record)
        const mr = await prisma.medicalRecord.create({
            data: {
                patient_id: patient.id,
                doctor_id: doctor.id,
                queue_id: queue.id,
                systolic: 120,
                diastolic: 80,
                heart_rate: 80,
                temperature: 36.5,
                weight: 70,
                height: 170,
                triage_status: 'COMPLETED', // Crucial for Doctor Dashboard
                subjective: 'Sakit Kepala',
                objective: 'Suhu normal, tensi normal',
                assessment: '-', // Required by Schema
                plan: '-'        // Required by Schema
            }
        });

        // Update Queue status
        await prisma.queue.update({
            where: { id: queue.id },
            data: { status: 'CALLED' } // Nurse called them
        });

        console.log(`   Triage Completed. MR created with ID: ${mr.id}. Triage Status: ${mr.triage_status}`);

        // 4. Doctor Dashboard Check
        console.log("4. Verifying Doctor Dashboard Visibility...");

        // Logic from DoctorDashboard.jsx: 
        // fetch queues where triage_status = COMPLETED (or MR exists)
        // usually via GET /doctor/queue

        // Simulate query
        const doctorQueue = await prisma.queue.findMany({
            where: {
                daily_quota: { doctor_id: doctor.id, date: today },
                // status: { not: 'COMPLETED' }, // Doctor sees actively waiting
                medical_records: {
                    some: { triage_status: 'COMPLETED' }
                }
            },
            include: {
                patient: true,
                medical_records: true
            }
        });

        const found = doctorQueue.find(q => q.id === queue.id);

        if (found) {
            console.log("✅ SUCCESS: Patient appears in Doctor Queue!");
            console.log(`   Patient: ${found.patient.name}`);
            console.log(`   Triage Data: ${JSON.stringify(found.medical_records[0].vital_signs)}`);
        } else {
            console.error("❌ FAILURE: Patient NOT found in Doctor Queue query.");
            console.log("   Debug: Doctor Queue length:", doctorQueue.length);
        }

    } catch (error) {
        console.error("Critical Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyRJFlow();
