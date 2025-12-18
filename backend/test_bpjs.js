const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testBPJS() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('Login Success. Token obtained.');

        // 2. Check BPJS (Mock NIK)
        console.log('Testing BPJS Check (NIK: 1234567890123456)...');
        const bpjsRes = await axios.post(
            `${BASE_URL}/bpjs/check-participant`,
            { nik: '1234567890123456' },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Response Status:', bpjsRes.status);
        console.log('Response Data:', JSON.stringify(bpjsRes.data, null, 2));

        if (bpjsRes.data.status === 'OK' && bpjsRes.data.data.statusPeserta.keterangan === 'AKTIF') {
            console.log('✅ VERIFICATION PASSED: BPJS Mock is working correctly.');
        } else {
            console.error('❌ VERIFICATION FAILED: Unexpected response.');
        }

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    }
}

testBPJS();
