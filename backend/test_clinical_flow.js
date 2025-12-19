
const axios = require('axios');
const LOGIN_URL = 'http://localhost:3000/api/auth/login';
const BASE_URL = 'http://localhost:3000/api';

async function runTest() {
    try {
        console.log('--- STARTING CLINICAL FLOW TEST ---');

        // 1. LOGIN (Doctor/Admin)
        const loginRes = await axios.post(LOGIN_URL, {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('✅ Login Success');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. CREATE PATIENT (Mock)
        const patientRes = await axios.post(`${BASE_URL}/patients`, {
            name: `Test Patient ${Date.now()}`,
            nik: `1234567890${Date.now().toString().slice(-6)}`,
            birth_date: '1990-01-01',
            gender: 'L',
            phone: '08123456789',
            address: 'Test Address'
        }, { headers });
        const patient = patientRes.data;
        console.log(`✅ Patient Created: ID ${patient.id}`);

        // 3. CREATE TICKET (Registration)
        // Need a doctor ID first
        const docsRes = await axios.get(`${BASE_URL}/doctors`, { headers });
        const doctor = docsRes.data[0];

        const ticketRes = await axios.post(`${BASE_URL}/queue/ticket`, {
            doctor_id: doctor.id,
            patient_id: patient.id
        }, { headers });
        const ticket = ticketRes.data.ticket;
        console.log(`✅ Ticket Created: ${ticket.queue_code} (ID: ${ticket.id})`);

        // 4. NURSE TRIAGE (Submit Vitals)
        // We simulate submitting Triage which creates a Medical Record linked to Queue
        const triageRes = await axios.post(`${BASE_URL}/medical-records`, {
            patient_id: patient.id,
            doctor_id: doctor.id,
            queue_id: ticket.id,
            systolic: 120,
            diastolic: 80,
            temperature: 36.5,
            subjective: 'TEST CHIEF COMPLAINT (TRIAGE)',
            plan: 'Triage Check'
        }, { headers });
        console.log(`✅ Triage Submitted (MR ID: ${triageRes.data.id})`);

        // 5. DOCTOR GET WAITING QUEUE (Verify Triage Data is included)
        const queueRes = await axios.get(`${BASE_URL}/queues/waiting?poli_id=${doctor.poliklinik_id}`, { headers });
        const myQueue = queueRes.data.find(q => q.id === ticket.id);

        if (myQueue && myQueue.medical_records && myQueue.medical_records.length > 0) {
            console.log('✅ VERIFIED: Queue contains Medical Records');
            console.log('   -> Subjective:', myQueue.medical_records[0].subjective);
            if (myQueue.medical_records[0].subjective === 'TEST CHIEF COMPLAINT (TRIAGE)') {
                console.log('   ✅ DATA MATCH: Chief Complaint Passed successfully');
            } else {
                console.error('   ❌ DATA MISMATCH');
            }
        } else {
            console.error('❌ FAILED: Queue does not contain Medical Records');
            console.log(JSON.stringify(myQueue, null, 2));
        }

        // 6. DOCTOR ORDERS LAB (Service Order)
        const orderRes = await axios.post(`${BASE_URL}/service-orders`, {
            medical_record_id: triageRes.data.id,
            type: 'LAB',
            notes: 'Cek Darah Lengkap'
        }, { headers });

        if (orderRes.data.id && orderRes.data.type === 'LAB') {
            console.log(`✅ Service Order Created: ${orderRes.data.type} (ID: ${orderRes.data.id})`);
        } else {
            console.error('❌ Service Order Failed');
        }

        console.log('--- TEST COMPLETED ---');

    } catch (error) {
        console.error('❌ TEST FAILED:', error.response ? error.response.data : error.message);
    }
}

runTest();
