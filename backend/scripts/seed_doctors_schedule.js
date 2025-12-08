const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = [
    {
        poli: "POLI ANAK",
        code: "PA",
        doctors: [
            {
                name: "dr. RR Irma Rossyana, Sp. A",
                schedules: [
                    { days: [1, 2, 3, 4, 5, 6], time: "08.00 - 14.00" } // Senin s.d Sabtu
                ]
            }
        ]
    },
    {
        poli: "POLI BEDAH MULUT",
        code: "PBM",
        doctors: [
            {
                name: "drg. Robby Romadhanie, Sp. BMM",
                schedules: [
                    { days: [2], time: "08.00 - Selesai" }, // Selasa
                    { days: [5, 6], time: "14.00 - Selesai" } // Jumat & Sabtu
                ]
            }
        ]
    },
    {
        poli: "POLI BEDAH UMUM",
        code: "PBU",
        doctors: [
            {
                name: "dr. Endro RI Wibowo, Sp. B",
                schedules: [
                    { days: [1, 2, 3, 4], time: "07.00 - 10.00" }, // Pagi (Senin - Kamis)
                    { days: [1, 2, 3, 4], time: "14.00 - 17.00" }, // Sore (Senin - Kamis)
                    { days: [5], time: "13.00 - 17.00" }, // Jumat
                    { days: [6], time: "13.00 - 15.00" }  // Sabtu
                ]
            },
            {
                name: "dr. Suroso, Sp. B",
                schedules: [
                    { days: [5, 6], time: "07.00 - 09.00" } // Jumat & Sabtu
                ]
            }
        ]
    },
    {
        poli: "FISIOTERAPI",
        code: "FIS",
        doctors: [
            {
                name: "Bingsar Galih / Panca Nugraha / NuR Kumala Ratri",
                schedules: [
                    { days: [1, 2, 3], time: "13.00 - 18.00" }, // Pasien BPJS: Senin s.d Rabu
                    // Note: Combining Pasien Umum into the same schedule slots for simplicity unless specific separation is needed by schema
                    // For now adding them as distinct entries might confuse the simple schema, so I will add them as aggregate or separate logic if needed. 
                    // The request implies different times for different patient types. 
                    // Current schema doesn't support "Patient Type" in schedule. 
                    // I will combine them for now or list them all.
                    // Let's list the other times:
                    { days: [1, 2, 3], time: "08.00 - 13.00" }, // Pasien Umum: Senin-Rabu
                    { days: [4, 5, 6], time: "07.00 - 14.00" }  // Pasien Umum: Kamis-Sabtu
                ]
            }
        ]
    },
    {
        poli: "POLI GIGI KONSERVASI",
        code: "PGK",
        doctors: [
            {
                name: "drg. Dyah Tri Kusuma, Sp. KG",
                schedules: [
                    { days: [3], time: "17.00 - Selesai" } // Rabu
                ]
            }
        ]
    },
    {
        poli: "POLI GIGI UMUM",
        code: "PGU",
        doctors: [
            {
                name: "drg. Rafika Yusniar",
                schedules: [
                    { days: [1, 3, 5], time: "14.30 - Selesai" } // Senin, Rabu, Jumat
                ]
            },
            {
                name: "drg. Yulinda Primilisa",
                schedules: [
                    { days: [2, 4, 6], time: "14.30 - Selesai" } // Selasa, Kamis, Sabtu
                ]
            }
        ]
    },
    {
        poli: "POLI JANTUNG",
        code: "JA",
        doctors: [
            {
                name: "dr. Lita Hati Dwi PE, Sp. JP",
                schedules: [
                    { days: [2, 4], time: "14.00 - 18.00" }, // Selasa & Kamis
                    { days: [6], time: "08.00 - 14.00" } // Sabtu
                ]
            }
        ]
    },
    {
        poli: "POLI KANDUNGAN (OBGYN)",
        code: "OBG",
        doctors: [
            {
                name: "dr. Gatot Hananta, Sp. OG",
                schedules: [
                    { days: [2, 4, 6], time: "10.00 - Selesai" }
                ]
            },
            {
                name: "dr. Hepta Lidia, Sp. OG",
                schedules: [
                    { days: [1, 3, 5], time: "10.00 - Selesai" }
                ]
            },
            {
                name: "dr. Pritasari Dewi D, Sp. OG",
                schedules: [
                    { days: [1, 2, 4, 5], time: "14.30 - Selesai" }
                ]
            }
        ]
    },
    {
        poli: "POLI KEDOKTERAN JIWA",
        code: "JIW",
        doctors: [
            {
                name: "dr. Taufik Hidayanto, Sp. KJ",
                schedules: [
                    { days: [1, 2, 4, 5], time: "14.30 - Selesai" }
                ]
            },
            {
                name: "dr. Nova Kurniasari, Sp. KJ",
                schedules: [
                    { days: [1, 2, 3], time: "07.30 - 09.30" }
                ]
            }
        ]
    },
    {
        poli: "POLI MATA",
        code: "MATA",
        doctors: [
            {
                name: "dr. Wahid Heru Widodo, Sp. M",
                schedules: [
                    { days: [1, 2, 3, 4, 5], time: "07.00 - 10.00" }
                ]
            }
        ]
    },
    {
        poli: "POLI ORTHOPAEDI (TULANG)",
        code: "ORT",
        doctors: [
            {
                name: "dr. Muhammad Luthfi, Sp. OT",
                schedules: [
                    { days: [1, 2, 3, 4, 5, 6], time: "11.00 - Selesai" }
                ]
            },
            {
                name: "dr. Nanda Notario, Sp. OT",
                schedules: [
                    { days: [1, 2, 4, 5, 6], time: "08.00 - 10.30" },
                    { days: [3], time: "09.00 - Selesai" }
                ]
            }
        ]
    },
    {
        poli: "POLI PARU",
        code: "PARU",
        doctors: [
            {
                name: "dr. Oke Viska, Sp. P",
                schedules: [
                    { days: [5], time: "10.00 - Selesai" },
                    { days: [1, 2, 3, 4, 6], time: "13.00 - Selesai" }
                ]
            }
        ]
    },
    {
        poli: "POLI PENYAKIT DALAM",
        code: "PDL",
        doctors: [
            {
                name: "dr. Leo Chandra WPW, Sp. PD, M. KES",
                schedules: [
                    { days: [1, 2, 3, 4, 5, 6], time: "08.00 - 14.00" }, // Pagi
                    { days: [1, 2, 3, 4], time: "18.00 - Selesai" }      // Sore
                ]
            },
            {
                name: "dr. Sigit Purnomohadi, Sp. PD",
                schedules: [
                    { days: [2], time: "14.30 - 17.00" },
                    { days: [5], time: "13.30 - 16.00" }
                ]
            }
        ]
    },
    {
        poli: "PSIKOLOGI",
        code: "PSI",
        doctors: [
            {
                name: "Siti K Sa'diyah, M. Psi. Psikologi",
                schedules: [
                    { days: [1, 2, 3, 4, 5], time: "08.00 - 11.00" }
                ]
            }
        ]
    },
    {
        poli: "POLI REHAB MEDIK",
        code: "RM",
        doctors: [
            {
                name: "dr. Syarif Hasan, Sp. KFR",
                schedules: [
                    { days: [1, 2, 3], time: "13.30 - Selesai" }
                ]
            }
        ]
    },
    {
        poli: "POLI SARAF",
        code: "SAR",
        doctors: [
            {
                name: "dr. Ajeng Putri, Sp. N",
                schedules: [
                    { days: [1], time: "15.00 - Selesai" },
                    { days: [4], time: "13.00 - Selesai" },
                    { days: [5], time: "14.00 - Selesai" }
                ]
            },
            {
                name: "dr. Setyo Dirahayu, Sp. N",
                schedules: [
                    { days: [2, 3], time: "14.00 - Selesai" },
                    { days: [6], time: "13.00 - Selesai" }
                ]
            },
            {
                name: "dr. Ahmad Tanji, Sp. N",
                schedules: [
                    { days: [1], time: "06.00 - 08.00" },
                    { days: [3], time: "07.30 - 09.30" }
                ]
            }
        ]
    },
    {
        poli: "TERAPI WICARA",
        code: "TW",
        doctors: [
            {
                name: "Nony Eka Ariyandini, S. Tr. Kes",
                schedules: [
                    { days: [1, 2, 3], time: "10.00 - 17.00" },
                    { days: [4, 5, 6], time: "07.00 - 14.00" }
                ]
            }
        ]
    },
    {
        poli: "POLI THT - KL",
        code: "THT",
        doctors: [
            {
                name: "dr. Lirans Tia K, Sp. THT KL",
                schedules: [
                    { days: [1, 3], time: "14.00 - 18.00" },
                    { days: [2, 4], time: "08.00 - 12.00" },
                    { days: [5], time: "13.00 - 15.00" }
                ]
            },
            {
                name: "dr. Wahyu Dwi K, Sp. THT KL",
                schedules: [
                    { days: [4], time: "16.00 - Selesai" },
                    { days: [6], time: "14.00 - Selesai" }
                ]
            }
        ]
    },
    {
        poli: "POLI UMUM",
        code: "PUM",
        doctors: [
            {
                name: "dr. Sofian Palupi",
                schedules: [
                    { days: [1, 2, 3, 4, 5], time: "09.00 - 12.00" }
                ]
            }
        ]
    },
    {
        poli: "POLI UROLOGI",
        code: "URO",
        doctors: [
            {
                name: "dr. Eko Subekti, Sp. U",
                schedules: [
                    { days: [1, 3, 5], time: "18.00 - Selesai" }
                ]
            }
        ]
    }
];

async function main() {
    console.log('Start seeding doctors and schedules...');

    for (const p of data) {
        console.log(`Processing ${p.poli}...`);

        // Upsert Poliklinik
        const poliklinik = await prisma.poliklinik.upsert({
            where: { queue_code: p.code },
            update: { name: p.poli }, // Update name just in case
            create: {
                name: p.poli,
                queue_code: p.code,
            },
        });

        for (const d of p.doctors) {
            // Find or create doctor
            // Note: Schema doesn't have unique name, so we use findFirst. 
            // Ideally we would upsert by ID or unique key, but we only have names.
            // We'll try to find by name + poliklinik_id

            let doctor = await prisma.doctor.findFirst({
                where: {
                    name: d.name,
                    poliklinik_id: poliklinik.id
                }
            });

            if (!doctor) {
                doctor = await prisma.doctor.create({
                    data: {
                        name: d.name,
                        specialist: p.poli, // Defaulting specialist to poli name if unknown, or we could parse. 
                        // But some like "Sp. A" are in the name. User didn't give separate field.
                        poliklinik_id: poliklinik.id,
                        photo_url: "https://via.placeholder.com/150", // Default placeholder
                    }
                });
                console.log(`  Created doctor: ${d.name}`);
            } else {
                console.log(`  Found doctor: ${d.name}`);
            }

            // Sync Schedules
            // Strategy: Delete existing and recreate
            await prisma.doctorSchedule.deleteMany({
                where: { doctor_id: doctor.id }
            });

            for (const s of d.schedules) {
                for (const day of s.days) {
                    await prisma.doctorSchedule.create({
                        data: {
                            doctor_id: doctor.id,
                            day: day,
                            time: s.time
                        }
                    });
                }
            }
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
