const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function runTest() {
    console.log('🚀 Starting RJ Workflow Verification...');

    try {
        // 1. CREATE PATIENT (Mock)
        console.log('\n--- 1. REGISTERING PATIENT ---');
        // Assuming patient 1 exists or using seed data. Let's use ID 1.
        const patientId = 1;

        // 2. GET DOCTOR & QUOTA
        const doctorsRes = await axios.get(`${API_URL}/doctors`);
        const doctor = doctorsRes.data[0];
        console.log(`👨‍⚕️ Selected Doctor: ${doctor.name} (${doctor.poliklinik.name})`);

        // 3. TAKE TICKET
        const ticketRes = await axios.post(`${API_URL}/queue/ticket`, {
            doctor_id: doctor.id,
            patient_id: patientId
        });
        const ticket = ticketRes.data.ticket;
        console.log(`🎫 Ticket Created: ${ticket.queue_code} (ID: ${ticket.id})`);

        // 4. NURSE STATION: FETCH TRIAGE QUEUE & SUBMIT VITALS
        console.log('\n--- 2. NURSE STATION (TRIAGE) ---');
        const triageQueueRes = await axios.get(`${API_URL}/triage/queue`);
        const queueItem = triageQueueRes.data.find(q => q.id === ticket.id);

        if (!queueItem) throw new Error("Ticket not found in Triage Queue!");
        console.log(`✅ Patient found in Nurse Station list.`);

        // Submit Vitals
        const vitalData = {
            vitals: {
                systolic: 120, diastolic: 80, heart_rate: 88, temperature: 36.5,
                weight: 70, height: 175
            },
            chief_complaint: 'Sakit Kepala Migrain',
            triage_level: 5, // Non Urgent (Poli)
            allergies: 'None'
        };
        await axios.post(`${API_URL}/triage/${ticket.id}/submit`, vitalData);
        console.log(`✅ Vitals Submitted.`);

        // 5. DOCTOR DASHBOARD: FETCH WAITING & VERIFY VITALS
        console.log('\n--- 3. DOCTOR DASHBOARD ---');
        const doctorQueueRes = await axios.get(`${API_URL}/queues/waiting?poli_id=${doctor.poliklinik.id}`);
        const docQueueItem = doctorQueueRes.data.find(q => q.id === ticket.id);

        if (!docQueueItem) throw new Error("Ticket not found in Doctor Waiting List!");

        const mr = docQueueItem.medical_records[0];
        if (!mr) throw new Error("Medical Record missing in Doctor View!");

        console.log(`🔍 Verifying Data Transmission:`);
        console.log(`   - Complaint: ${mr.chief_complaint} (Expected: Sakit Kepala Migrain)`);
        console.log(`   - BP: ${mr.systolic}/${mr.diastolic} (Expected: 120/80)`);

        if (mr.chief_complaint === 'Sakit Kepala Migrain' && mr.systolic === 120) {
            console.log(`🎉 SUCCESS: Data flow verified!`);
        } else {
            console.error(`❌ FAILURE: Data mismatch.`);
        }

        // Cleanup (Optional: Complete ticket)
        // await axios.post(`${API_URL}/queue/complete`, { ticket_id: ticket.id });

    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
    }
}

runTest();
