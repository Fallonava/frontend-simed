const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Define Polikliniks
    const polies = [
        { name: 'Poli Bedah & Orthopaedi', code: 'BDH' },
        { name: 'Poli Kandungan & Anak', code: 'OBS' },
        { name: 'Poli Penyakit Dalam & Jantung', code: 'INT' },
        { name: 'Poli Saraf, Jiwa & Mata', code: 'NRG' },
        { name: 'Poli THT, Paru & Urologi', code: 'THT' },
        { name: 'Poli Gigi & Rehabilitasi', code: 'DNT' },
        { name: 'Layanan Penunjang Lainnya', code: 'OTH' },
        { name: 'Poli Umum', code: 'UMM' }
    ];

    const createdPolies = {};
    for (const p of polies) {
        createdPolies[p.code] = await prisma.poliklinik.upsert({
            where: { queue_code: p.code },
            update: { name: p.name },
            create: { name: p.name, queue_code: p.code }
        });
    }

    // 2. Define Doctors with Schedules
    const doctorsData = [
        // Bedah & Orthopaedi
        {
            name: 'dr. Muhammad Luthfi, Sp. OT',
            specialist: 'Orthopaedi',
            poliCode: 'BDH',
            schedules: [{ days: [1, 2, 3, 4, 5, 6], time: '11.00 - Selesai' }]
        },
        {
            name: 'dr. Nanda Notario, Sp. OT',
            specialist: 'Orthopaedi',
            poliCode: 'BDH',
            schedules: [
                { days: [1, 2, 4, 5, 6], time: '08.00 - 10.30' },
                { days: [3], time: '09.00 - Selesai' }
            ]
        },
        {
            name: 'dr. Endro RI Wibowo, Sp. B',
            specialist: 'Bedah Umum',
            poliCode: 'BDH',
            schedules: [
                { days: [1, 2, 3, 4], time: '07.00 - 10.00 & 14.00 - 17.00' },
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
        {
            name: 'drg. Robby Romadhanie, Sp. BMM',
            specialist: 'Bedah Mulut',
            poliCode: 'DNT', // Moved to Dental group based on input structure, but kept logic flexible
            schedules: [
                { days: [2], time: '08.00 - Selesai' },
                { days: [5, 6], time: '14.00 - Selesai' }
            ]
        },

        // Kandungan & Anak
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
        {
            name: 'dr. RR Irma Rossyana, Sp. A',
            specialist: 'Anak',
            poliCode: 'OBS',
            schedules: [{ days: [1, 2, 3, 4, 5, 6], time: '08.00 - 14.00' }]
        },

        // Penyakit Dalam & Jantung
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
        {
            name: 'dr. Lita Hati Dwi PE, Sp. JP',
            specialist: 'Jantung',
            poliCode: 'INT',
            schedules: [
                { days: [2, 4], time: '14.00 - 18.00' },
                { days: [6], time: '08.00 - 14.00' }
            ]
        },

        // Saraf, Jiwa & Mata
        {
            name: 'dr. Ajeng Putri, Sp. N',
            specialist: 'Saraf',
            poliCode: 'NRG',
            schedules: [
                { days: [1], time: '15.00 - Selesai' },
                { days: [4], time: '13.00 - Selesai' },
                { days: [5], time: '14.00 - Selesai' }
            ]
        },
        {
            name: 'dr. Setyo Dirahayu, Sp. N',
            specialist: 'Saraf',
            poliCode: 'NRG',
            schedules: [
                { days: [2, 3], time: '14.00 - Selesai' },
                { days: [6], time: '13.00 - Selesai' }
            ]
        },
        {
            name: 'dr. Ahmad Tanji, Sp. N',
            specialist: 'Saraf',
            poliCode: 'NRG',
            schedules: [
                { days: [1], time: '06.00 - 08.00' },
                { days: [3], time: '07.30 - 09.30' }
            ]
        },
        {
            name: 'dr. Wahid Heru Widodo, Sp. M',
            specialist: 'Mata',
            poliCode: 'NRG',
            schedules: [{ days: [1, 2, 3, 4, 5], time: '07.00 - 10.00' }]
        },
        {
            name: 'dr. Taufik Hidayanto, Sp. KJ',
            specialist: 'Kedokteran Jiwa',
            poliCode: 'NRG',
            schedules: [{ days: [1, 2, 4, 5], time: '14.30 - Selesai' }]
        },
        {
            name: 'dr. Nova Kurniasari, Sp. KJ',
            specialist: 'Kedokteran Jiwa',
            poliCode: 'NRG',
            schedules: [{ days: [1, 2, 3], time: '07.30 - 09.30' }]
        },

        // THT, Paru & Urologi
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
        {
            name: 'dr. Oke Viska, Sp. P',
            specialist: 'Paru',
            poliCode: 'THT',
            schedules: [
                { days: [5], time: '10.00 - Selesai' },
                { days: [1, 2, 3, 4, 6], time: '13.00 - Selesai' }
            ]
        },
        {
            name: 'dr. Eko Subekti, Sp. U',
            specialist: 'Urologi',
            poliCode: 'THT',
            schedules: [{ days: [1, 3, 5], time: '18.00 - Selesai' }]
        },

        // Gigi & Rehabilitasi
        {
            name: 'drg. Rafika Yusniar',
            specialist: 'Gigi Umum',
            poliCode: 'DNT',
            schedules: [{ days: [1, 3, 5], time: '14.30 - Selesai' }]
        },
        {
            name: 'drg. Yulinda Primilisa',
            specialist: 'Gigi Umum',
            poliCode: 'DNT',
            schedules: [{ days: [2, 4, 6], time: '14.30 - Selesai' }]
        },
        {
            name: 'drg. Dyah Tri Kusuma, Sp. KG',
            specialist: 'Gigi Konservasi',
            poliCode: 'DNT',
            schedules: [{ days: [3], time: '17.00 - Selesai' }]
        },
        {
            name: 'dr. Syarif Hasan, Sp. KFR',
            specialist: 'Rehab Medik',
            poliCode: 'DNT',
            schedules: [{ days: [1, 2, 3], time: '13.30 - Selesai' }]
        },
        {
            name: 'Tim Fisioterapi',
            specialist: 'Fisioterapi',
            poliCode: 'DNT',
            schedules: [
                { days: [1, 2, 3], time: '13.00 - 18.00 (BPJS)' },
                { days: [1, 2, 3], time: '08.00 - 13.00 (Umum)' },
                { days: [4, 5, 6], time: '07.00 - 14.00 (Umum)' }
            ]
        },

        // Penunjang Lainnya
        {
            name: "Siti K Sa'diyah, M. Psi. Psikologi",
            specialist: 'Psikologi',
            poliCode: 'OTH',
            schedules: [{ days: [1, 2, 3, 4, 5], time: '08.00 - 11.00' }]
        },
        {
            name: 'Nony Eka Ariyandini, S. Tr. Kes',
            specialist: 'Terapi Wicara',
            poliCode: 'OTH',
            schedules: [
                { days: [1, 2, 3], time: '10.00 - 17.00' },
                { days: [4, 5, 6], time: '07.00 - 14.00' }
            ]
        },
        {
            name: 'dr. Sofian Palupi',
            specialist: 'Umum',
            poliCode: 'UMM',
            schedules: [{ days: [1, 2, 3, 4, 5], time: '09.00 - 12.00' }]
        }
    ];

    for (const d of doctorsData) {
        // Find or create doctor
        const existing = await prisma.doctor.findFirst({ where: { name: d.name } });
        let doctorId;

        if (existing) {
            doctorId = existing.id;
            await prisma.doctor.update({
                where: { id: doctorId },
                data: {
                    specialist: d.specialist,
                    poliklinik_id: createdPolies[d.poliCode].id
                }
            });
        } else {
            const newDoc = await prisma.doctor.create({
                data: {
                    name: d.name,
                    specialist: d.specialist,
                    poliklinik_id: createdPolies[d.poliCode].id,
                    photo_url: 'https://via.placeholder.com/150'
                }
            });
            doctorId = newDoc.id;
        }

        // Update Schedules
        await prisma.doctorSchedule.deleteMany({ where: { doctor_id: doctorId } });

        const scheduleData = [];
        d.schedules.forEach(s => {
            s.days.forEach(day => {
                scheduleData.push({
                    doctor_id: doctorId,
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
