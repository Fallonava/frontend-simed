const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function runTest() {
    console.log('--- STARTING ANTREAN JKN TEST ---');

    try {
        // 1. GET STATUS (Simulate Opening Mobile JKN)
        console.log('📱 1. Checking Poli Status...');
        const statusRes = await axios.get(`${BASE_URL}/antrean/status/1/${new Date().toISOString().split('T')[0]}`);
        console.log('✅ Status Response:', statusRes.data.response?.namapoli || 'OK');

        // 2. BOOK TICKET (Ambil Antrean)
        console.log('🎫 2. Booking Ticket (Ambil Antrean)...');
        const bookingPayload = {
            nomorkartu: '0001234567891',
            nik: '3201010101010001',
            kodepoli: '1', // Mocking DoctorID/PoliID
            tanggalperiksa: '2023-12-20',
            keluhan: 'Demam'
        };
        const bookRes = await axios.post(`${BASE_URL}/antrean/ambil`, bookingPayload);
        const ticket = bookRes.data.response;
        console.log(`✅ Booking Success! Code: ${ticket.nomorantrean}, BookingID: ${ticket.kodebooking}`);

        // 3. CHECK SISA ANTREAN (Realtime Monitor)
        console.log('📊 3. Checking Sisa Antrean...');
        const sisaRes = await axios.get(`${BASE_URL}/antrean/sisa`);
        const polilist = sisaRes.data.response;

        // Find our poli
        const myPoli = polilist.find(p => p.namadokter === ticket.namadokter || p.sisaantrean > 0);
        if (myPoli) {
            console.log(`✅ Sisa Antrean Found: ${myPoli.namapoli} - Sisa: ${myPoli.sisaantrean}`);
        } else {
            console.warn('⚠️ Poli not found in Sisa List (might be generic/mock names)');
            console.log(polilist);
        }

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
