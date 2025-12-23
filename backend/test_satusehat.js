const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
// Use Admin Auth
const LOGIN_URL = `${BASE_URL}/auth/login`;

async function runTest() {
    console.log('--- STARTING SATUSEHAT TEST ---');

    try {
        // 1. LOGIN
        const loginRes = await axios.post(LOGIN_URL, {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Login Success');

        // 2. SEARCH PATIENT (BY NIK)
        console.log('🔍 1. Search Patient by NIK (Mock)...');
        // Use a dummy NIK
        const nik = '3200000000000001';
        const searchRes = await axios.get(`${BASE_URL}/satusehat/patient?nik=${nik}`, { headers });
        console.log('✅ Patient IHS:', searchRes.data.ihs_number);
        console.log('✅ Patient Name:', searchRes.data.name);

        // 3. CREATE ENCOUNTER (Check-In)
        console.log('🏥 2. Create Encounter (Visit)...');
        const encounterRes = await axios.post(`${BASE_URL}/satusehat/encounter`, {
            patient_id: 1, // Internal ID
            doctor_name: 'Dr. Test',
            start_time: new Date()
        }, { headers });
        console.log('✅ Encounter Created (ID):', encounterRes.data.id);
        console.log('✅ Encounter Subject:', encounterRes.data.subject.reference);

        console.log('--- TEST COMPLETED ---');

    } catch (error) {
        console.error('❌ TEST FAILED:');
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

runTest();
