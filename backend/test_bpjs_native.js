const BASE_URL = 'http://localhost:3000/api';

async function testBPJS() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) {
            throw new Error(`Login Failed: ${loginRes.status}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login Success. Token obtained.');

        // 2. Check BPJS (Mock NIK: 1234567890123456)
        console.log('Testing BPJS Check (NIK: 1234567890123456)...');
        const bpjsRes = await fetch(`${BASE_URL}/bpjs/check-participant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nik: '1000000000000001' })
        });

        console.log('Response Status:', bpjsRes.status);
        const bpjsData = await bpjsRes.json();
        console.log('Response Data:', JSON.stringify(bpjsData, null, 2));

        if (bpjsData.status === 'OK' && bpjsData.data.statusPeserta.keterangan === 'AKTIF') {
            console.log('✅ VERIFICATION PASSED: BPJS Check working.');

            // 3. Test Create SEP (Mock)
            console.log('Testing Create SEP...');
            const sepRes = await fetch(`${BASE_URL}/bpjs/sep/insert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    noKartu: '000123456001',
                    poli: 'INT',
                    rujukan: '1234567',
                    diagnosa: 'A00.1'
                })
            });

            const sepData = await sepRes.json();
            console.log('SEP Response:', JSON.stringify(sepData, null, 2));

            if (sepData.status === 'OK' && sepData.data.noSep) {
                console.log('✅ VERIFICATION PASSED: SEP Created successfully.');
            } else {
                console.error('❌ SE P FAILED');
            }

        } else {
            console.error('❌ VERIFICATION FAILED: Unexpected response.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testBPJS();
