const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:3000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Mock Admin Token
const adminToken = jwt.sign(
    { id: 1, username: 'admin', role: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '1h' }
);
const headers = { Authorization: `Bearer ${adminToken}` };

async function verifyIGDFlow() {
    console.log("🏥 STARTING IGD FLOW VERIFICATION...");

    try {
        // 1. REGISTER NEW PATIENT (IGD)
        const patientName = `EmergencyPatient_${Date.now()}`;
        console.log(`\n1. Registering Patient: ${patientName}`);

        // Create Patient first (if needed) or use existing mechanism
        // Assuming we need a patient ID. Let's create one via a hypothetical endpoint or just use Queue Registration if it handles new patient.
        // Let's assume we register a new patient first.
        const patientRes = await axios.post(`${API_URL}/patients`, {
            name: patientName,
            nik: `320${Date.now()}`,
            address: 'Jalan Darurat No. 1',
            birth_date: '1990-01-01',
            gender: 'L',
            phone: '08123456789'
        }, { headers });
        const patientId = patientRes.data.id;
        console.log(`   -> Patient Created. ID: ${patientId}`);

        // 2. CHECK-IN TO IGD (Register Ticket)
        // Find IGD Polyclinic and Doctor
        const polies = await axios.get(`${API_URL}/polies`, { headers });
        const igdPoly = polies.data.find(p => p.name.includes('IGD')) || polies.data[0];

        // Find Doctor schedule for today (simplified: get all doctors)
        const doctors = await axios.get(`${API_URL}/doctors`, { headers });
        const doctor = doctors.data[0]; // Just pick first doctor

        console.log(`\n2. Creating IGD Ticket for Poly: ${igdPoly.name}, Doc: ${doctor.name}`);
        const queueRes = await axios.post(`${API_URL}/queue/ticket`, {
            patient_id: patientId,
            doctor_id: doctor.id,
            service_type: 'BPJS' // or UMUM
        }, { headers });

        const queueId = queueRes.data.ticket.id;
        console.log(`   -> Ticket Created. Queue ID: ${queueId}, Code: ${queueRes.data.ticket.queue_code}`);

        // 3. CHECK TRIAGE QUEUE
        console.log(`\n3. Checking Triage Queue...`);
        const triageQueue = await axios.get(`${API_URL}/triage/queue`, { headers });
        const triageItem = triageQueue.data.find(t => t.id === queueId);

        if (triageItem) {
            console.log(`   -> ✅ Patient found in Triage Queue.`);
        } else {
            console.error(`   -> ❌ Patient NOT found in Triage Queue! Response:`, triageQueue.data.map(t => t.id));
            process.exit(1);
        }

        // 4. SUBMIT TRIAGE (Nurse Station)
        console.log(`\n4. Submitting Triage Assessment...`);
        const triageRes = await axios.post(`${API_URL}/triage/${queueId}/submit`, {
            vitals: {
                systolic: 110,
                diastolic: 70,
                heart_rate: 88,
                temperature: 37.5,
                respiratory_rate: 20,
                oxygen_saturation: 98
            },
            chief_complaint: 'Severe abdominal pain',
            allergies: 'Peanuts',
            triage_level: 2 // Emergency
        }, { headers });
        console.log(`   -> Triage Submitted. Status: ${triageRes.status}`);

        // 5. DOCTOR DASHBOARD - FETCH PATIENT
        console.log(`\n5. Doctor Fetching Patient Queue...`);
        const docQueue = await axios.get(`${API_URL}/queues/waiting?poli_id=${igdPoly.id}`, { headers });
        const myPatient = docQueue.data.find(q => q.id === queueId);

        if (myPatient) {
            console.log(`   -> ✅ Patient found in Doctor Queue.`);
            // Check if Triage info is attached
            if (myPatient.medical_records && myPatient.medical_records[0].triage_level === 2) {
                console.log(`   -> ✅ Triage Level (ATS 2) is visible to Doctor.`);
            } else {
                console.warn(`   -> ⚠️ Triage Level NOT visible or mismatch.`);
            }
        } else {
            console.error(`   -> ❌ Patient NOT found in Doctor Queue!`);
        }

        // 6. ADMIT PATIENT (Check-In to Ward)
        console.log(`\n6. Admitting Patient to Inpatient Ward...`);

        // Get Available Room/Bed
        const roomsRes = await axios.get(`${API_URL}/admission/rooms`, { headers });
        let targetBedId = null;

        // Find first available bed
        // Structure: [ { beds: [ { id, status: 'AVAILABLE' } ] } ]
        outerLoop:
        for (const room of (Array.isArray(roomsRes.data) ? roomsRes.data : roomsRes.data.data)) {
            if (room.beds) {
                for (const bed of room.beds) {
                    if (bed.status === 'AVAILABLE') {
                        targetBedId = bed.id;
                        break outerLoop;
                    }
                }
            }
        }

        if (!targetBedId) {
            console.error(`   -> ❌ No Available Beds found! Cannot test admission.`);
            // If no beds, create one? Or just skip.
            // Assume init_db created beds.
        } else {
            console.log(`   -> Found Bed ID: ${targetBedId}. Attempting admission...`);
            const admitRes = await axios.post(`${API_URL}/admission/checkin`, {
                patientId: patientId,
                bedId: targetBedId,
                diagnosa: 'Acute Abdominal Pain'
            }, { headers });

            console.log(`   -> Admission Result:`, admitRes.data);

            // 7. VERIFY BED STATUS
            console.log(`\n7. Verifying Bed Status...`);
            const roomsAfter = await axios.get(`${API_URL}/admission/rooms`, { headers });
            let bedFound = false;

            // Check if bed is now OCCUPIED
            for (const room of (Array.isArray(roomsAfter.data) ? roomsAfter.data : roomsAfter.data.data)) {
                const bed = room.beds?.find(b => b.id === targetBedId);
                if (bed) {
                    if (bed.status === 'OCCUPIED' && bed.current_patient?.id === patientId) {
                        console.log(`   -> ✅ Bed ${targetBedId} is now OCCUPIED by Patient ${patientId}.`);
                        bedFound = true;
                    } else {
                        console.error(`   -> ❌ Bed Status Mismatch! Expected OCCUPIED, Got: ${bed.status}`);
                    }
                }
            }
        }

        console.log("\n✨ IGD FLOW VERIFICATION COMPLETE ✨");

    } catch (error) {
        console.error("❌ VERIFICATION FAILED:", error.response?.data || error.message);
    }
}

verifyIGDFlow();
