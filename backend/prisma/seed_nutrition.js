const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const diets = [
    { name: 'Nasi Biasa (Regular)', code: 'NB', type: 'REGULAR', calories: 2100, desc: 'Standard balanced diet' },
    { name: 'Bubur Halus', code: 'BH', type: 'SOFT', calories: 1500, desc: 'Soft diet for easy digestion' },
    { name: 'Bubur Saring', code: 'BS', type: 'LIQUID', calories: 1200, desc: 'Liquid diet for post-op' },
    { name: 'Diet DM 1700 kkal', code: 'DM1700', type: 'DIET', calories: 1700, desc: 'Diabetes Mellitus Diet' },
    { name: 'Diet Rendah Garam (RG)', code: 'RG', type: 'DIET', calories: 1900, desc: 'Low Salt (Hypertension)' },
    { name: 'Diet Rendah Protein (RP)', code: 'RP', type: 'DIET', calories: 1600, desc: 'Kidney Friendly Diet' },
    { name: 'Diet Jantung (J)', code: 'DJ', type: 'DIET', calories: 1800, desc: 'Heart Friendly / Low Fat' },
    { name: 'Tinggi Kalori Tinggi Protein', code: 'TKTP', type: 'DIET', calories: 2500, desc: 'High Calorie High Protein' }
];

async function main() {
    console.log('🥦 Seeding Nutrition Menus...');

    for (const d of diets) {
        const exist = await prisma.dietMenu.findUnique({ where: { code: d.code } });
        if (!exist) {
            await prisma.dietMenu.create({
                data: {
                    name: d.name,
                    code: d.code,
                    type: d.type,
                    calories: d.calories,
                    description: d.desc
                }
            });
            console.log(`Created: ${d.name}`);
        }
    }
    console.log('✅ Nutrition Seed Done.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
