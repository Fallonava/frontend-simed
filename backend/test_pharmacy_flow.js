const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const LOGIN_URL = `${BASE_URL}/auth/login`;

async function runTest() {
    console.log('--- STARTING PHARMACY FLOW TEST ---');

    try {
        // 1. LOGIN
        const loginRes = await axios.post(LOGIN_URL, {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('✅ Login Success');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. GET PREREQUISITES
        // Patient
        const patientsRes = await axios.get(`${BASE_URL}/patients`, { headers }).catch(() => ({ data: [] }));
        let patientId = patientsRes.data.length > 0 ? patientsRes.data[0].id : null;

        if (!patientId) {
            // Create dummy patient if none
            const newPatient = await axios.post(`${BASE_URL}/patients`, {
                nik: `TEST${Date.now()}`,
                name: 'Pharmacy Test Patient',
                birth_date: '1990-01-01',
                gender: 'L',
                no_rm: `RM-${Date.now()}`
            }, { headers });
            patientId = newPatient.data.id;
            console.log('✅ Created Dummy Patient:', patientId);
        } else {
            console.log('✅ Using Existing Patient:', patientId);
        }

        // Doctor
        const doctorsRes = await axios.get(`${BASE_URL}/doctors-master`, { headers }).catch(() => ({ data: [] }));
        const doctorId = doctorsRes.data[0].id;
        console.log('✅ Using Doctor:', doctorId);

        // Medicines
        const medsRes = await axios.get(`${BASE_URL}/medicines`, { headers });
        const med = medsRes.data.find(m => m.stock >= 5); // Find one with enough stock
        if (!med) throw new Error('No medicine with sufficient stock found');
        console.log(`✅ Selected Medicine: ${med.name} (Stock: ${med.stock})`);

        // 3. CREATE MEDICAL RECORD
        const mrRes = await axios.post(`${BASE_URL}/medical-records`, {
            patient_id: patientId,
            doctor_id: doctorId,
            subjective: 'Sakit Kepala',
            objective: 'TD Normal',
            assessment: 'Migraine',
            plan: 'Resep Obat'
        }, { headers });
        const mrId = mrRes.data.id;
        console.log('✅ Created Medical Record:', mrId);

        // 4. CREATE PRESCRIPTION (Simulate Doctor Dashboard)
        const qtyToOrder = 2;
        const prescRes = await axios.post(`${BASE_URL}/prescriptions`, {
            medical_record_id: mrId,
            doctor_id: doctorId,
            patient_id: patientId,
            notes: 'Diminum setelah makan',
            items: [
                {
                    medicine_id: med.id,
                    quantity: qtyToOrder,
                    dosage: '3x1',
                    notes: 'Tablet'
                }
            ]
        }, { headers });
        const prescId = prescRes.data.id;
        console.log('✅ Created Prescription:', prescId);

        // 5. VERIFY PENDING STOCK (Should NOT change yet)
        const medCheck1 = await axios.get(`${BASE_URL}/medicines`, { headers });
        const medAfterOrder = medCheck1.data.find(m => m.id === med.id);
        if (medAfterOrder.stock !== med.stock) {
            console.error(`❌ STOCK MISMATCH: Expected ${med.stock}, Got ${medAfterOrder.stock} (Stock should not change on creation)`);
        } else {
            console.log('✅ Verified Stock Unchanged (Pending)');
        }

        // 6. PROCESS PRESCRIPTION (Simulate Pharmacy)
        console.log('💊 Processing Prescription (Pharmacy)...');
        await axios.put(`${BASE_URL}/prescriptions/${prescId}/status`, {
            status: 'COMPLETED' // Logic triggers stock deduction
        }, { headers });
        console.log('✅ Prescription Processed (COMPLETED)');

        // 7. VERIFY FINAL STOCK
        const medCheck2 = await axios.get(`${BASE_URL}/medicines`, { headers });
        const medFinal = medCheck2.data.find(m => m.id === med.id);
        if (medFinal.stock === med.stock - qtyToOrder) {
            console.log(`✅ VERIFIED STOCK DEDUCTION: ${med.stock} -> ${medFinal.stock}`);
        } else {
            console.error(`❌ STOCK DEDUCTION FAILED: Expected ${med.stock - qtyToOrder}, Got ${medFinal.stock}`);
        }

        console.log('--- TEST COMPLETED ---');

    } catch (error) {
        console.error('❌ TEST FAILED:', error.response?.data || error.message);
    }
}

runTest();
