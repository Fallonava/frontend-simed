const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const LOGIN_URL = `${BASE_URL}/auth/login`;

async function runTest() {
    console.log('--- STARTING BILLING FLOW TEST ---');

    try {
        // 1. LOGIN
        const loginRes = await axios.post(LOGIN_URL, {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Login Success');

        // 2. CREATE PATIENT & MEDICAL RECORD (To be "Billable")
        const patientsRes = await axios.get(`${BASE_URL}/patients`, { headers }).catch(() => ({ data: [] }));
        let patientId = patientsRes.data.length > 0 ? patientsRes.data[0].id : null;
        if (!patientId) {
            const newPatient = await axios.post(`${BASE_URL}/patients`, {
                nik: `BILL${Date.now()}`,
                name: 'Billing Test Patient',
                birth_date: '1985-05-05',
                gender: 'P',
                no_rm: `RM-BILL-${Date.now()}`
            }, { headers });
            patientId = newPatient.data.id;
        }

        const doctorsRes = await axios.get(`${BASE_URL}/doctors-master`, { headers });
        const doctorId = doctorsRes.data[0].id;

        // Create Medical Record (Completed)
        const mrRes = await axios.post(`${BASE_URL}/medical-records`, {
            patient_id: patientId,
            doctor_id: doctorId,
            subjective: 'Test Billing',
            objective: 'Test',
            assessment: 'Healthy', // Mark as complete
            plan: 'Pay bill'
        }, { headers });
        const mrId = mrRes.data.id;
        console.log('✅ Created Completed Medical Record:', mrId);

        // 3. VERIFY IT APPEARS IN "BILLABLES"
        const billablesRes = await axios.get(`${BASE_URL}/finance/billables`, { headers });
        const found = billablesRes.data.data.find(r => r.id === mrId);
        if (found) {
            console.log('✅ Verified Record appears in Billable List');
        } else {
            throw new Error('Record NOT found in Billable List');
        }

        // 4. GENERATE INVOICE
        const invoiceRes = await axios.post(`${BASE_URL}/finance/generate`, {
            medicalRecordId: mrId
        }, { headers });
        const invoice = invoiceRes.data.data;
        console.log('✅ Invoice Generated:', invoice.id, 'Total:', invoice.total_amount);

        if (invoice.total_amount <= 0) console.warn('⚠️ Warning: Total Amount is 0 or negative');
        if (invoice.status !== 'PENDING') throw new Error('Invoice status should be PENDING');

        // 5. VERIFY IT DISAPPEARS FROM BILLABLES
        const billablesCheck = await axios.get(`${BASE_URL}/finance/billables`, { headers });
        const foundCheck = billablesCheck.data.data.find(r => r.id === mrId);
        if (!foundCheck) {
            console.log('✅ Verified Record REMOVED from Billable List (Correct)');
        } else {
            console.error('❌ Record STILL in Billable List');
        }

        // 6. PAY INVOICE
        const payRes = await axios.post(`${BASE_URL}/finance/pay/${invoice.id}`, {
            method: 'QRIS'
        }, { headers });
        if (payRes.data.data.status === 'PAID') {
            console.log('✅ Invoice PAID Successfully');
        } else {
            throw new Error('Payment Failed');
        }

        // 7. VERIFY REPORT
        const reportRes = await axios.get(`${BASE_URL}/finance/report`, { headers });
        console.log(`✅ Daily Report OK. Total Income Today: ${reportRes.data.totalIncome}`);

        console.log('--- TEST COMPLETED ---');

    } catch (error) {
        console.error('❌ TEST FAILED:', error.response?.data || error.message);
    }
}

runTest();
