const BASE_URL = 'http://localhost:3000/api';

async function testVClaimV2() {
    try {
        // 0. Login
        console.log('Login...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        console.log('LOGIN DATA:', JSON.stringify(loginData));
        const token = loginData.token || loginData.data?.token;
        console.log('TOKEN:', token);
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

        // 1. TEST BACKDATE (Should FAIL if > 3 days)
        console.log('\n--- TEST 1: Backdate Validation (> 4 days) ---');
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 5);
        const isoOld = oldDate.toISOString().split('T')[0];

        const res1 = await fetch(`${BASE_URL}/bpjs/sep/insert`, {
            method: 'POST', headers,
            body: JSON.stringify({
                noKartu: '000123456001',
                poli: 'INT',
                tgl_sep_custom: isoOld
            })
        });
        const js1 = await res1.json();
        console.log('DEBUG RES 1:', JSON.stringify(js1));
        console.log(`[${js1.status}] ${js1.message || 'OK'}`);
        if (js1.status === 'FAILED') console.log('✅ Correctly rejected old backdate');

        // 2. TEST IGD LOW URGENCY (Should WARNING)
        console.log('\n--- TEST 2: IGD Low Urgency (Diagnosa J30) ---');
        const res2 = await fetch(`${BASE_URL}/bpjs/sep/insert`, {
            method: 'POST', headers,
            body: JSON.stringify({
                noKartu: '000123456001',
                poli: 'IGD',
                is_igd: true,
                diagnosa: 'J30.1' // Allergic Rhinitis (Not Emergency)
            })
        });
        const js2 = await res2.json();
        console.log(`[${js2.status}] ${js2.message || 'OK'}`);
        if (js2.status === 'WARNING') console.log('✅ Correctly flagged Low Urgency');

        // 3. TEST KLL (Traffic Accident)
        console.log('\n--- TEST 3: KLL (Traffic Accident) ---');
        const res3 = await fetch(`${BASE_URL}/bpjs/sep/insert`, {
            method: 'POST', headers,
            body: JSON.stringify({
                noKartu: '000123456001',
                poli: 'BEDAH',
                is_kll: true,
                diagnosa: 'S02.9' // Fracture of skull
            })
        });
        const js3 = await res3.json();
        console.log(`[${js3.status}] ${js3.message || 'OK'}`);
        if (js3.status === 'OK' && js3.data.catatan.includes('KLL')) console.log('✅ Correctly created KLL SEP');

    } catch (e) {
        console.error(e);
    }
}

testVClaimV2();
