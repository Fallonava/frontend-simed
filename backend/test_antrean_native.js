const BASE_URL = 'http://localhost:3000/api';

async function testAntrean() {
    try {
        // 1. Check Status Antrean
        console.log('Testing GET /antrean/status...');
        const statusRes = await fetch(`${BASE_URL}/antrean/status/INT/2025-12-18`);
        const statusData = await statusRes.json();
        console.log('Status Response:', JSON.stringify(statusData, null, 2));

        if (statusData.metadata.code === 200) {
            console.log('✅ Status Antrean OK');
        } else {
            console.error('❌ Status Antrean Failed');
        }

        // 2. Ambil Antrean (Booking)
        console.log('\nTesting POST /antrean/ambil...');
        const ambilRes = await fetch(`${BASE_URL}/antrean/ambil`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nomorkartu: '000123456789',
                nik: '1234567890123456',
                kodepoli: 'INT',
                tanggalperiksa: '2025-12-18',
                keluhan: 'Demam'
            })
        });
        const ambilData = await ambilRes.json();
        console.log('Booking Response:', JSON.stringify(ambilData, null, 2));

        if (ambilData.metadata.code === 200 && ambilData.response.kodebooking) {
            console.log('✅ Booking Antrean OK (' + ambilData.response.kodebooking + ')');
        } else {
            console.error('❌ Booking Antrean Failed');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAntrean();
