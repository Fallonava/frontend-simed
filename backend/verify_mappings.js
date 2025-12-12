const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:postgres@localhost:5432/simed?schema=public"
        }
    }
});

const targetNames = [
    "Irma Rossyana",
    "Leo Chandra",
    "Wahyu Dwi",
    "Lirans Tia",
    "Nova Kurniasari",
    "Taufik Hidayanto",
    "Eko Subekti",
    "Hotman",
    "Setyo Dirahayu",
    "Endro",
    "Oke Viska",
    "Robby Romadhanie",
    "Dyah Tri Kusuma",
    "Muhammad Luthfi",
    "Lita Hati",
    "Wati",
    "Syarif Hasan"
];

async function main() {
    console.log("Checking Doctors...");
    const doctors = await prisma.doctor.findMany();

    for (const target of targetNames) {
        // Simple case-insensitive match
        const matches = doctors.filter(d => d.name.toLowerCase().includes(target.toLowerCase()));

        if (matches.length === 0) {
            console.log(`[NOT FOUND] ${target}`);
        } else if (matches.length === 1) {
            console.log(`[MATCH] ${target} -> ID: ${matches[0].id}, Name: ${matches[0].name}`);
        } else {
            console.log(`[AMBIGUOUS] ${target} -> Found ${matches.length}:`);
            matches.forEach(m => console.log(`   - ID: ${m.id}, Name: ${m.name}`));
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
