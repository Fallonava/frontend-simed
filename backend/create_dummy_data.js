const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:3000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const adminToken = jwt.sign(
    { id: 1, username: 'admin', role: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '1h' }
);
const headers = { Authorization: `Bearer ${adminToken}` };

async function createPendingOrders() {
    console.log("🧪 CREATING PENDING LAB/RAD DATA FOR UI TESTING...");

    try {
        // 1. REGISTER PATIENT
        const patientName = `Demo Patient ${Date.now().toString().slice(-4)}`;
        console.log(`\n1. Creating Patient: ${patientName}`);
        const patientRes = await axios.post(`${API_URL}/patients`, {
            name: patientName,
            nik: `3209${Date.now()}`,
            address: 'Jalan Demo UI',
            birth_date: '1990-01-01',
            gender: 'L',
            phone: '08123456789'
        }, { headers });
        const patientId = patientRes.data.id;

        // 2. CREATE TICKET
        const doctors = await axios.get(`${API_URL}/doctors`, { headers });
        const doctor = doctors.data[0];
        const queueRes = await axios.post(`${API_URL}/queue/ticket`, {
            patient_id: patientId,
            doctor_id: doctor.id,
            service_type: 'UMUM'
        }, { headers });
        const queueId = queueRes.data.ticket.id;

        // 3. CREATE MEDICAL RECORD
        const mrRes = await axios.post(`${API_URL}/medical-records`, {
            patient_id: patientId,
            doctor_id: doctor.id,
            queue_id: queueId,
            subjective: 'Demam tinggi 3 hari',
            objective: 'Suhu 39C',
            assessment: 'Febris suspect DHF',
            plan: 'Cek Darah Lengkap'
        }, { headers });
        const medicalRecordId = mrRes.data.id;

        // 4. ORDER LAB (PENDING)
        console.log(`\n2. Creating PENDING Lab Order...`);
        const labRes = await axios.post(`${API_URL}/service-orders`, {
            medical_record_id: medicalRecordId,
            type: 'LAB',
            notes: 'Cek Darah Lengkap (CBC), NS1'
        }, { headers });
        console.log(`   -> Created Lab Order ID: ${labRes.data.id}`);

        // 5. ORDER RAD (PENDING)
        console.log(`\n3. Creating PENDING Radiology Order...`);
        const radRes = await axios.post(`${API_URL}/service-orders`, {
            medical_record_id: medicalRecordId,
            type: 'RAD',
            notes: 'Rontgen Thorax'
        }, { headers });
        console.log(`   -> Created Rad Order ID: ${radRes.data.id}`);

        console.log("\n✅ DONE! Please check Lab & Radiology Dashboards.");

    } catch (error) {
        console.error("FAILED:", error.response?.data || error.message);
    }
}

createPendingOrders();
