// MOCK Antrean Online Controller (Standard HFIS/BPJS Specs)
// In production, this interacts with specific BPJS Bridging endpoints.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. GET Status Antrean (Untuk Mobile JKN display)
// URL: /antrean/status/:kodepoli/:tanggal
exports.getStatusAntrean = async (req, res) => {
    const { kodepoli, tanggal } = req.params;

    // Mock logic: Find daily quota for this Poli
    // In Simulation, we map kodepoli 'INT' -> internal ID or just randomize

    // Simulate Data
    const totalAntrean = 50; // Random/Mock
    const sisaAntrean = 20;
    const antreanPanggil = 'A-30';

    return res.json({
        metadata: { message: "Ok", code: 200 },
        response: {
            namapoli: "POLI PENYAKIT DALAM (MOCK)",
            namadokter: "Dr. Spesialis (Simulasi)",
            totalantrean: totalAntrean,
            sisaantrean: sisaAntrean,
            antreanpanggil: antreanPanggil,
            sisakuotajkn: 5,
            kuotajkn: 30,
            sisakuotanonjkn: 5,
            kuotanonjkn: 20,
            keterangan: "Jadwal buka s.d jam 12:00"
        }
    });
};

// 2. GET Sisa Antrean (Realtime Check)
// URL: /antrean/sisa
exports.getSisaAntrean = async (req, res) => {
    // This is usually per code/poli
    // We will just return a mock aggregate list
    return res.json({
        metadata: { message: "Ok", code: 200 },
        response: [
            {
                namapoli: "POLI UMUM",
                namadokter: "Dr. Umum 1",
                sisaantrean: 5,
                antreanpanggil: "A-5",
                waktutunggu: 300 // Detik
            },
            {
                namapoli: "POLI GIGI",
                namadokter: "Drg. Gigi 1",
                sisaantrean: 2,
                antreanpanggil: "B-2",
                waktutunggu: 120
            }
        ]
    });
};

// 3. POST Ambil Antrean (Booking Antrean)
// URL: /antrean/ambil
exports.ambilAntrean = async (req, res) => {
    const { nomorkartu, nik, keluhan, kodepoli, tanggalperiksa } = req.body;

    // Simulate Success Booking
    const mockKodeBooking = `BK-${Date.now().toString().slice(-6)}`;
    const mockNomorAntrean = `A-${Math.floor(Math.random() * 50) + 1}`;

    return res.json({
        metadata: { message: "Sukses", code: 200 },
        response: {
            nomorantrean: mockNomorAntrean,
            kodebooking: mockKodeBooking,
            jenisantrean: 1,
            estimasidilayani: Date.now() + 3600000, // +1 Hour
            namapoli: "POLI SIMULASI",
            namadokter: "Dokter Simulasi",
        }
    });
};
