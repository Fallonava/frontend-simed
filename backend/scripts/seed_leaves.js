const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const leavesData = [
    // 1. POLI ANAK - dr. RR Irma Rossyana, Sp. A (ID 1)
    { doctor_id: 1, dates: ['2025-12-13', '2025-12-22', '2025-12-23', '2025-12-24', '2025-12-26', '2025-12-27', '2025-12-31'], reason: 'Cuti' },
    { doctor_id: 1, dates: ['2025-12-25', '2026-01-01'], reason: 'Libur Nasional' },

    // 2. POLI PENYAKIT DALAM - dr. Leo Chandra WPW (ID 21)
    { doctor_id: 21, dates: ['2025-12-04', '2025-12-05', '2025-12-06'], reason: 'Cuti' },

    // 3. POLI THT - dr. Wahyu Dwi K (ID 30)
    { doctor_id: 30, dates: ['2025-12-04', '2025-12-06'], reason: 'Cuti' },
    // dr. Lirans Tia K (ID 29)
    { doctor_id: 29, dates: ['2025-12-25'], reason: 'Libur Nasional' },
    { doctor_id: 29, dates: ['2025-12-26', '2025-12-29'], reason: 'Cuti' },

    // 4. POLI KEDOKTERAN JIWA - dr. Nova Kurniasari (ID 16)
    { doctor_id: 16, dates: ['2025-12-22', '2025-12-23'], reason: 'Cuti' },
    // dr. Taufik Hidayanto (ID 15)
    { doctor_id: 15, dates: ['2025-12-25', '2025-12-26'], reason: 'Cuti/Libur' },

    // 5. POLI UROLOGI - dr. Eko Subekti (ID 32)
    // Range 15-22 Dec
    { doctor_id: 32, dates: ['2025-12-15', '2025-12-16', '2025-12-17', '2025-12-18', '2025-12-20', '2025-12-21', '2025-12-22'], reason: 'Cuti' },
    { doctor_id: 32, dates: ['2025-12-19'], reason: 'Digantikan dr. Hotman' }, // Special note for 19th

    // 6. POLI SARAF - dr. Setyo Dirahayu (ID 26)
    { doctor_id: 26, dates: ['2025-12-06'], reason: 'Cuti' },

    // 7. POLI BEDAH UMUM - dr. Endro RI Wibowo (ID 3)
    { doctor_id: 3, dates: ['2025-12-25', '2026-01-01'], reason: 'Libur Nasional' },

    // 8. POLI PARU - dr. Oke Viska (ID 20)
    { doctor_id: 20, dates: ['2025-12-06', '2025-12-08', '2025-12-20'], reason: 'Cuti' },

    // 9. POLI BEDAH MULUT - drg. Robby Romadhanie (ID 2)
    // Range 19-30 Dec
    {
        doctor_id: 2,
        range: { start: '2025-12-19', end: '2025-12-30' },
        reason: 'Izin (Umroh)'
    },

    // 10. POLI GIGI KONSERVASI - drg. Dyah Tri Kusuma (ID 8)
    { doctor_id: 8, dates: ['2025-12-24', '2025-12-31'], reason: 'Libur/Cuti (Dialihkan ke 7 Jan 2026)' },

    // 11. POLI ORTHOPAEDI - dr. Muhammad Luthfi (ID 18)
    { doctor_id: 18, dates: ['2025-12-12', '2025-12-25', '2025-12-26'], reason: 'Cuti' },

    // 12. POLI JANTUNG - dr. Lita Hati Dwi PE (ID 11)
    { doctor_id: 11, dates: ['2025-12-25', '2026-01-01'], reason: 'Libur Nasional' },
    { doctor_id: 11, dates: ['2025-12-27'], reason: 'Cuti' },

    // 13. POLI REHAB MEDIK - dr. Syarif Hasan (ID 24) [dr. Wati]
    { doctor_id: 24, dates: ['2025-12-25'], reason: 'Libur Nasional' },
    { doctor_id: 24, dates: ['2025-12-31'], reason: 'Cuti' },
];

async function main() {
    console.log('Scaling leaves...');

    const recordsToInsert = [];

    for (const item of leavesData) {
        if (item.dates) {
            for (const dateStr of item.dates) {
                recordsToInsert.push({
                    doctor_id: item.doctor_id,
                    date: new Date(dateStr),
                    reason: item.reason
                });
            }
        } else if (item.range) {
            const start = new Date(item.range.start);
            const end = new Date(item.range.end);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                recordsToInsert.push({
                    doctor_id: item.doctor_id,
                    date: new Date(d),
                    reason: item.reason
                });
            }
        }
    }

    // Upsert logic (using createMany with skipDuplicates might depend on provider version, 
    // but Prisma `createMany` supports `skipDuplicates` for Postgres).
    // However, to ensure safety or updates, we can just use loop with upsert or ignore conflict.
    // For simplicity with bulk, we'll try createMany and catch duplicates, or cleaner: check existence?
    // Let's use `createMany` with `skipDuplicates: true`.

    try {
        const result = await prisma.doctorLeave.createMany({
            data: recordsToInsert,
            skipDuplicates: true,
        });
        console.log(`Inserted ${result.count} leave records.`);
    } catch (error) {
        console.error('Error inserting leaves:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
