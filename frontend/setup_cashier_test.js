import axios from 'axios';

const API_URL = 'https://dev.fallonava.my.id/api';

async function run() {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('   Token received.');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('2. Fetching Patient...');
        const patientsRes = await axios.get(`${API_URL}/patients?limit=1`, config);
        const patient = patientsRes.data[0] || patientsRes.data.patients?.[0] || patientsRes.data.data?.[0]; // Adjust based on actual response structure
        if (!patient) throw new Error('No patients found');
        console.log(`   Patient: ${patient.name} (ID: ${patient.id})`);

        console.log('3. Fetching Doctor...');
        const doctorsRes = await axios.get(`${API_URL}/doctors-master`, config); // or /doctors
        const doctor = doctorsRes.data[0];
        if (!doctor) throw new Error('No doctors found');
        console.log(`   Doctor: ${doctor.name} (ID: ${doctor.id})`);

        console.log('4. Creating Medical Record (Visit)...');
        const recordData = {
            patient_id: patient.id,
            doctor_id: doctor.id,
            subjective: 'Test complaint',
            objective: 'Test observation',
            assessment: 'Test Diagnosis (Ready for Billing)',
            plan: 'Paracetamol',
            systolic: 120,
            diastolic: 80
        };

        const recordRes = await axios.post(`${API_URL}/medical-records`, recordData, config);
        console.log(`   Medical Record Created (ID: ${recordRes.data.id})`);
        console.log('SUCCESS: Data prepared for Cashier Test.');

    } catch (error) {
        console.error('ERROR:', error.response?.data || error.message);
    }
}

run();
