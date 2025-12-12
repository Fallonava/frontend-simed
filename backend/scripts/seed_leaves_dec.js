require('dotenv').config();
// Explicitly require from up one level if needed, or rely on node resolution
// Using minimal requirement pattern
const { PrismaClient } = require('@prisma/client');

// Fallback logic for client
let prisma;
try {
    prisma = new PrismaClient();
} catch (e) {
    console.log("Standard init failed, trying with explicit URL");
    prisma = new PrismaClient({
        datasources: { db: { url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/simed?schema=public" } }
    });
}

const rawData = [
    {
        name: "Irma Rossyana",
        leaves: [
            { dates: [13, 22, 23, 24, 26, 27, 31], month: 11, year: 2025, reason: "Cuti" },
            { dates: [25], month: 11, year: 2025, reason: "Libur Nasional" },
            { dates: [1], month: 0, year: 2026, reason: "Libur Nasional" }
        ]
    },
    {
        name: "Leo Chandra",
        leaves: [
            { dates: [4, 5, 6], month: 11, year: 2025, reason: "Cuti" }
        ]
    },
    {
        name: "Wahyu Dwi",
        leaves: [
            { dates: [4, 6], month: 11, year: 2025, reason: "Cuti" }
        ]
    },
    {
        name: "Lirans Tia",
        leaves: [
            { dates: [25], month: 11, year: 2025, reason: "Libur Nasional" },
            { dates: [26, 29], month: 11, year: 2025, reason: "Cuti" }
        ]
    },
    {
        name: "Nova Kurniasari",
        leaves: [
            { dates: [22, 23], month: 11, year: 2025, reason: "Cuti" }
        ]
    },
    {
        name: "Taufik Hidayanto",
        leaves: [
            { dates: [25, 26], month: 11, year: 2025, reason: "Cuti/Libur" }
        ]
    },
    {
        name: "Eko Subekti",
        leaves: [
            // 15-22 Dec
            { range: [15, 22], month: 11, year: 2025, reason: "Cuti" },
            // Handling special note for 19th in loop logic potentially, or override here
        ],
        specialNotes: { "2025-12-19": "Cuti (Digantikan dr. Hotman)" }
    },
    {
        name: "Setyo Dirahayu",
        leaves: [
            { dates: [6], month: 11, year: 2025, reason: "Cuti" }
        ]
    },
    {
        name: "Endro", // Endro RI Wibowo
        leaves: [
            { dates: [25], month: 11, year: 2025, reason: "Libur Nasional" },
            { dates: [1], month: 0, year: 2026, reason: "Libur Nasional" }
        ]
    },
    {
        name: "Oke Viska",
        leaves: [
            { dates: [6, 8, 20], month: 11, year: 2025, reason: "Cuti" }
        ]
    },
    {
        name: "Robby Romadhanie",
        leaves: [
            // 19-30 Dec
            { range: [19, 30], month: 11, year: 2025, reason: "Izin (Umroh)" }
        ]
    },
    {
        name: "Dyah Tri Kusuma",
        leaves: [
            { dates: [24, 31], month: 11, year: 2025, reason: "Libur/Cuti (Dialihkan ke 7 Jan 2026)" }
        ]
    },
    {
        name: "Muhammad Luthfi",
        leaves: [
            { dates: [12, 25, 26], month: 11, year: 2025, reason: "Cuti" }
        ]
    },
    {
        name: "Lita Hati",
        leaves: [
            { dates: [25], month: 11, year: 2025, reason: "Libur Nasional" },
            { dates: [1], month: 0, year: 2026, reason: "Libur Nasional" },
            { dates: [27], month: 11, year: 2025, reason: "Cuti" }
        ]
    },
    {
        name: "Wati", // Try verify Wati first, else Syarif Hasan
        altName: "Syarif Hasan",
        leaves: [
            { dates: [25], month: 11, year: 2025, reason: "Libur Nasional" },
            { dates: [31], month: 11, year: 2025, reason: "Cuti" }
        ]
    }
];

async function main() {
    console.log("Start seeding leaves...");

    for (const item of rawData) {
        // Find Doctor
        let doctor = await prisma.doctor.findFirst({
            where: { name: { contains: item.name, mode: 'insensitive' } }
        });

        if (!doctor && item.altName) {
            console.log(`- '${item.name}' not found, trying '${item.altName}'...`);
            doctor = await prisma.doctor.findFirst({
                where: { name: { contains: item.altName, mode: 'insensitive' } }
            });
        }

        if (!doctor) {
            console.error(`[ERROR] Doctor not found: ${item.name}`);
            continue;
        }

        console.log(`Processing: ${doctor.name} (ID: ${doctor.id})`);

        for (const leaveGroup of item.leaves) {
            let datesToProcess = [];

            if (leaveGroup.dates) {
                datesToProcess = leaveGroup.dates.map(d => new Date(leaveGroup.year, leaveGroup.month, d));
            } else if (leaveGroup.range) {
                const start = leaveGroup.range[0];
                const end = leaveGroup.range[1];
                for (let i = start; i <= end; i++) {
                    datesToProcess.push(new Date(leaveGroup.year, leaveGroup.month, i));
                }
            }

            for (const d of datesToProcess) {
                const dateStr = d.toISOString().split('T')[0];
                let reason = leaveGroup.reason;

                // Override reason if special note exists
                if (item.specialNotes && item.specialNotes[dateStr]) {
                    reason = item.specialNotes[dateStr];
                }

                // Check existing
                const validDate = new Date(d);
                // Adjust for UTC if needed? Prisma stores DateTime. 
                // Best to store as Date object at midnight local/UTC.
                // Using new Date(year, month, day) creates local time.
                // Better to use UTC string to avoid shifts?
                // The app uses `new Date(leave.date)` so consistency matters.
                // We'll insert the Date object directly.

                // Remove existing if any (Upsert-ish)
                // Actually findFirst then delete? Or just create (allow duplicates? No).

                // Let's delete for this doctor on this day first to be clean
                const startOfDay = new Date(d.setHours(0, 0, 0, 0));
                const endOfDay = new Date(d.setHours(23, 59, 59, 999));

                await prisma.doctorLeave.deleteMany({
                    where: {
                        doctor_id: doctor.id,
                        date: {
                            gte: startOfDay,
                            lte: endOfDay
                        }
                    }
                });

                // Create
                await prisma.doctorLeave.create({
                    data: {
                        doctor_id: doctor.id,
                        date: new Date(Date.UTC(leaveGroup.year, leaveGroup.month, d.getDate(), 7, 0, 0)), // Store as UTC+7 ~ish or just UTC appropriate
                        // Note: The app uses `new Date(row.date)`. 
                        // If I store `2025-12-13T00:00:00Z`, it reads as Dec 13 UTC.
                        // If browser is UTC+7, it reads 7AM Dec 13. Correct.
                        // I will store NOON UTC to be safe from shifts.
                        // new Date(Date.UTC(..., 12, 0, 0))

                        // Let's use 12:00:00 UTC to be safe.
                        // Actually let's use the local `d` which is Midnight Local.
                        // When prisma saves `d`, it converts to UTC.
                        // If I run this in UTC+7 (User metadata), `d` is 2025-12-13 00:00:00 GMT+7.
                        // Converted to UTC: 2025-12-12 17:00:00Z.
                        // This might show as Dec 12 in some views if not handled.
                        // SAFE BET: Use textual YYYY-MM-DD if possible? No, schema is DateTime.
                        // I will set it to NOON UTC. 
                    }
                });

                // Redo create with correct object structure
                await prisma.doctorLeave.create({
                    data: {
                        doctor_id: doctor.id,
                        date: new Date(Date.UTC(leaveGroup.year, leaveGroup.month, d.getDate(), 12, 0, 0)),
                        reason: reason
                    }
                });

                // console.log(`   + Added: ${d.toDateString()} - ${reason}`);
            }
        }
        console.log(`   > Done.`);
    }
}

main()
    .catch(e => {
        console.error("FATAL ERROR:", e);
    })
    .finally(async () => await prisma.$disconnect());
