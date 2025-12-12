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
        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('2. Creating New Patient...');
        const newPatient = {
            name: `Test Patient ${Date.now()}`,
            nik: `999${Date.now()}`,
            phone: '08123456789',
            address: 'Test Address',
            birth_date: '1990-01-01',
            gender: 'L'
        };
        const patientRes = await axios.post(`${API_URL}/patients`, newPatient, config);
        const patient = patientRes.data;
        console.log(`   Patient Created: ${patient.name} (ID: ${patient.id})`);

        console.log('3. Fetching Doctor...');
        const doctorsRes = await axios.get(`${API_URL}/doctors-master`, config);
        const doctor = doctorsRes.data[0];
        if (!doctor) throw new Error('No doctors found');
        console.log(`   Doctor: ${doctor.name} (ID: ${doctor.id})`);

        console.log('4. Creating Queue Ticket...');
        const ticketRes = await axios.post(`${API_URL}/queue/ticket`, {
            doctor_id: doctor.id,
            patient_id: patient.id
        }, config);

        console.log(`   Ticket Created: ${ticketRes.data.ticket.queue_code}`);
        console.log('SUCCESS: Patient is in queue waiting for doctor.');

    } catch (error) {
        console.error('ERROR:', error.response?.data || error.message);
    }
}

run();
