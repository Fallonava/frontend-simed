const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up database...');
    // Delete in order to avoid foreign key constraints
    await prisma.queue.deleteMany();
    await prisma.dailyQuota.deleteMany();
    await prisma.doctorSchedule.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.poliklinik.deleteMany();
    // Users are kept or upserted

    console.log('Database cleaned. Starting seed...');

    // 1. Define Polikliniks
    // Mapping based on the provided list
    const polies = [
        { name: 'Poli Anak', code: 'ANK' },
        { name: 'Poli Bedah Mulut', code: 'BMM' },
        { name: 'Poli Bedah Umum', code: 'BDH' },
        { name: 'Fisioterapi', code: 'FIS' },
        { name: 'Poli Gigi Konservasi', code: 'KG' },
        { name: 'Poli Gigi Umum', code: 'GIG' },
        { name: 'Poli Jantung', code: 'JTG' },
        { name: 'Poli Kandungan (OBGYN)', code: 'OBS' },
        { name: 'Poli Kedokteran Jiwa', code: 'JIW' },
        { name: 'Poli Mata', code: 'MTA' },
        { name: 'Poli Orthopaedi (Tulang)', code: 'ORT' },
        { name: 'Poli Paru', code: 'PAR' },
        { name: 'Poli Penyakit Dalam', code: 'INT' },
        { name: 'Psikologi', code: 'PSI' },
        { name: 'Poli Rehab Medik', code: 'RHB' },
        { name: 'Poli Saraf', code: 'SRF' },
        { name: 'Terapi Wicara', code: 'TW' },
        { name: 'Poli THT - KL', code: 'THT' },
        { name: 'Poli Umum', code: 'UMM' },
        { name: 'Poli Urologi', code: 'URO' }
    ];

    const createdPolies = {};
    for (const p of polies) {
        createdPolies[p.code] = await prisma.poliklinik.create({
            data: { name: p.name, queue_code: p.code }
        });
    }

    // 2. Define Doctors with Schedules
    const doctorsData = [
        // 1. POLI ANAK
        {
            name: 'dr. RR Irma Rossyana, Sp. A',
            specialist: 'Anak',
            poliCode: 'ANK',
            schedules: [{ days: [1, 2, 3, 4, 5, 6], time: '08.00 - 14.00' }]
        },
        // 2. POLI BEDAH MULUT
        {
            name: 'drg. Robby Romadhanie, Sp. BMM',
            specialist: 'Bedah Mulut',
            poliCode: 'BMM',
            schedules: [
                { days: [2], time: '08.00 - Selesai' },
                { days: [5, 6], time: '14.00 - Selesai' }
            ]
        },
        // 3. POLI BEDAH UMUM
        {
            name: 'dr. Endro RI Wibowo, Sp. B',
            specialist: 'Bedah Umum',
            poliCode: 'BDH',
            schedules: [
                { days: [1, 2, 3, 4], time: '07.00 - 10.00' },
                { days: [1, 2, 3, 4], time: '14.00 - 17.00' },
                { days: [5], time: '13.00 - 17.00' },
                { days: [6], time: '13.00 - 15.00' }
            ]
        },
        {
            name: 'dr. Suroso, Sp. B',
            specialist: 'Bedah Umum',
            poliCode: 'BDH',
            schedules: [{ days: [5, 6], time: '07.00 - 09.00' }]
        },
        // 4. FISIOTERAPI
        {
            name: 'Bingsar Galih',
            specialist: 'Fisioterapis',
            poliCode: 'FIS',
            schedules: [
                { days: [1, 2, 3], time: '13.00 - 18.00 (BPJS)' },
                { days: [1, 2, 3], time: '08.00 - 13.00 (Umum)' },
                { days: [4, 5, 6], time: '07.00 - 14.00 (Umum)' }
            ]
        },
        {
            name: 'Panca Nugraha',
            specialist: 'Fisioterapis',
            poliCode: 'FIS',
            schedules: [
                { days: [1, 2, 3], time: '13.00 - 18.00 (BPJS)' },
                { days: [1, 2, 3], time: '08.00 - 13.00 (Umum)' },
                { days: [4, 5, 6], time: '07.00 - 14.00 (Umum)' }
            ]
        },
        {
            name: 'Nur Kumala Ratri',
            specialist: 'Fisioterapis',
            poliCode: 'FIS',
            schedules: [
                { days: [1, 2, 3], time: '13.00 - 18.00 (BPJS)' },
                { days: [1, 2, 3], time: '08.00 - 13.00 (Umum)' },
                { days: [4, 5, 6], time: '07.00 - 14.00 (Umum)' }
            ]
        },
        // 5. POLI GIGI KONSERVASI
        {
            name: 'drg. Dyah Tri Kusuma, Sp. KG',
            specialist: 'Gigi Konservasi',
            poliCode: 'KG',
            schedules: [{ days: [3], time: '17.00 - Selesai' }]
        },
        // 6. POLI GIGI UMUM
        {
            name: 'drg. Rafika Yusniar',
            specialist: 'Gigi Umum',
            poliCode: 'GIG',
            schedules: [{ days: [1, 3, 5], time: '14.30 - Selesai' }]
        },
        {
            name: 'drg. Yulinda Primilisa',
            specialist: 'Gigi Umum',
            poliCode: 'GIG',
            schedules: [{ days: [2, 4, 6], time: '14.30 - Selesai' }]
        },
        // 7. POLI JANTUNG
        {
            name: 'dr. Lita Hati Dwi PE, Sp. JP',
            specialist: 'Jantung',
            poliCode: 'JTG',
            schedules: [
                { days: [2, 4], time: '14.00 - 18.00' },
                { days: [6], time: '08.00 - 14.00' }
            ]
        },
        // 8. POLI KANDUNGAN (OBGYN)
        {
            name: 'dr. Gatot Hananta, Sp. OG',
            specialist: 'Kandungan',
            poliCode: 'OBS',
            schedules: [{ days: [2, 4, 6], time: '10.00 - Selesai' }]
        },
        {
            name: 'dr. Hepta Lidia, Sp. OG',
            specialist: 'Kandungan',
            poliCode: 'OBS',
            schedules: [{ days: [1, 3, 5], time: '10.00 - Selesai' }]
        },
        {
            name: 'dr. Pritasari Dewi D, Sp. OG',
            specialist: 'Kandungan',
            poliCode: 'OBS',
            schedules: [{ days: [1, 2, 4, 5], time: '14.30 - Selesai' }]
        },
        // 9. POLI KEDOKTERAN JIWA
        {
            name: 'dr. Taufik Hidayanto, Sp. KJ',
            specialist: 'Kedokteran Jiwa',
            poliCode: 'JIW',
            schedules: [{ days: [1, 2, 4, 5], time: '14.30 - Selesai' }]
        },
        {
            name: 'dr. Nova Kurniasari, Sp. KJ',
            specialist: 'Kedokteran Jiwa',
            poliCode: 'JIW',
            schedules: [{ days: [1, 2, 3], time: '07.30 - 09.30' }]
        },
        // 10. POLI MATA
        {
            name: 'dr. Wahid Heru Widodo, Sp. M',
            specialist: 'Mata',
            poliCode: 'MTA',
            schedules: [{ days: [1, 2, 3, 4, 5], time: '07.00 - 10.00' }]
        },
        // 11. POLI ORTHOPAEDI (TULANG)
        {
            name: 'dr. Muhammad Luthfi, Sp. OT',
            specialist: 'Orthopaedi',
            poliCode: 'ORT',
            schedules: [{ days: [1, 2, 3, 4, 5, 6], time: '11.00 - Selesai' }]
        },
        {
            name: 'dr. Nanda Notario, Sp. OT',
            specialist: 'Orthopaedi',
            poliCode: 'ORT',
            schedules: [
                { days: [1, 2, 4, 5, 6], time: '08.00 - 10.30' },
                { days: [3], time: '09.00 - Selesai' }
            ]
        },
        // 12. POLI PARU
        {
            name: 'dr. Oke Viska, Sp. P',
            specialist: 'Paru',
            poliCode: 'PAR',
            schedules: [
                { days: [5], time: '10.00 - Selesai' },
                { days: [1, 2, 3, 4, 6], time: '13.00 - Selesai' }
            ]
        },
        // 13. POLI PENYAKIT DALAM
        {
            name: 'dr. Leo Chandra WPW, Sp. PD, M. KES',
            specialist: 'Penyakit Dalam',
            poliCode: 'INT',
            schedules: [
                { days: [1, 2, 3, 4, 5, 6], time: '08.00 - 14.00' },
                { days: [1, 2, 3, 4], time: '18.00 - Selesai' }
            ]
        },
        {
            name: 'dr. Sigit Purnomohadi, Sp. PD',
            specialist: 'Penyakit Dalam',
            poliCode: 'INT',
            schedules: [
                { days: [2], time: '14.30 - 17.00' },
                { days: [5], time: '13.30 - 16.00' }
            ]
        },
        // 14. PSIKOLOGI
        {
            name: "Siti K Sa'diyah, M. Psi. Psikologi",
            specialist: 'Psikologi',
            poliCode: 'PSI',
            schedules: [{ days: [1, 2, 3, 4, 5], time: '08.00 - 11.00' }]
        },
        // 15. POLI REHAB MEDIK
        {
            name: 'dr. Syarif Hasan, Sp. KFR',
            specialist: 'Rehab Medik',
            poliCode: 'RHB',
            schedules: [{ days: [1, 2, 3], time: '13.30 - Selesai' }]
        },
        // 16. POLI SARAF
        {
            name: 'dr. Ajeng Putri, Sp. N',
            specialist: 'Saraf',
            poliCode: 'SRF',
            schedules: [
                { days: [1], time: '15.00 - Selesai' },
                { days: [4], time: '13.00 - Selesai' },
                { days: [5], time: '14.00 - Selesai' }
            ]
        },
        {
            name: 'dr. Setyo Dirahayu, Sp. N',
            specialist: 'Saraf',
            poliCode: 'SRF',
            schedules: [
                { days: [2, 3], time: '14.00 - Selesai' },
                { days: [6], time: '13.00 - Selesai' }
            ]
        },
        {
            name: 'dr. Ahmad Tanji, Sp. N',
            specialist: 'Saraf',
            poliCode: 'SRF',
            schedules: [
                { days: [1], time: '06.00 - 08.00' },
                { days: [3], time: '07.30 - 09.30' }
            ]
        },
        // 17. TERAPI WICARA
        {
            name: 'Nony Eka Ariyandini, S. Tr. Kes',
            specialist: 'Terapi Wicara',
            poliCode: 'TW',
            schedules: [
                { days: [1, 2, 3], time: '10.00 - 17.00' },
                { days: [4, 5, 6], time: '07.00 - 14.00' }
            ]
        },
        // 18. POLI THT - KL
        {
            name: 'dr. Lirans Tia K, Sp. THT KL',
            specialist: 'THT KL',
            poliCode: 'THT',
            schedules: [
                { days: [1, 3], time: '14.00 - 18.00' },
                { days: [2, 4], time: '08.00 - 12.00' },
                { days: [5], time: '13.00 - 15.00' }
            ]
        },
        {
            name: 'dr. Wahyu Dwi K, Sp. THT KL',
            specialist: 'THT KL',
            poliCode: 'THT',
            schedules: [
                { days: [4], time: '16.00 - Selesai' },
                { days: [6], time: '14.00 - Selesai' }
            ]
        },
        // 19. POLI UMUM
        {
            name: 'dr. Sofian Palupi',
            specialist: 'Umum',
            poliCode: 'UMM',
            schedules: [{ days: [1, 2, 3, 4, 5], time: '09.00 - 12.00' }]
        },
        // 20. POLI UROLOGI
        {
            name: 'dr. Eko Subekti, Sp. U',
            specialist: 'Urologi',
            poliCode: 'URO',
            schedules: [{ days: [1, 3, 5], time: '18.00 - Selesai' }]
        }
    ];

    for (const d of doctorsData) {
        const newDoc = await prisma.doctor.create({
            data: {
                name: d.name,
                specialist: d.specialist,
                poliklinik_id: createdPolies[d.poliCode].id,
                photo_url: 'https://via.placeholder.com/150'
            }
        });

        const scheduleData = [];
        d.schedules.forEach(s => {
            s.days.forEach(day => {
                scheduleData.push({
                    doctor_id: newDoc.id,
                    day: day,
                    time: s.time
                });
            });
        });

        if (scheduleData.length > 0) {
            for (const schedule of scheduleData) {
                await prisma.doctorSchedule.create({ data: schedule });
            }
        }
    }

    // Seed Users
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('loket123', 10);

    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPassword,
            role: 'ADMIN'
        }
    });

    await prisma.user.upsert({
        where: { username: 'loket1' },
        update: {},
        create: {
            username: 'loket1',
            password: staffPassword,
            role: 'STAFF'
        }
    });

    console.log('Seed data inserted');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
