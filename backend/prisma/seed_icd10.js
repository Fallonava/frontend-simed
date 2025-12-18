const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const icd10Data = [
    { code: 'A00', name: 'Cholera', description: 'Infectious disease' },
    { code: 'A01', name: 'Typhoid and paratyphoid fevers', description: 'Infectious disease' },
    { code: 'A09', name: 'Infectious gastroenteritis and colitis, unspecified', description: 'Diare' },
    { code: 'B01', name: 'Varicella [chickenpox]', description: 'Cacar air' },
    { code: 'B05', name: 'Measles', description: 'Campak' },
    { code: 'B20', name: 'Human immunodeficiency virus [HIV] disease', description: 'HIV' },
    { code: 'E10', name: 'Type 1 diabetes mellitus', description: 'Diabetes Tipe 1' },
    { code: 'E11', name: 'Type 2 diabetes mellitus', description: 'Diabetes Tipe 2' },
    { code: 'I10', name: 'Essential (primary) hypertension', description: 'Darah Tinggi' },
    { code: 'I20', name: 'Angina pectoris', description: 'Nyeri dada jantung' },
    { code: 'I21', name: 'Acute myocardial infarction', description: 'Serangan Jantung' },
    { code: 'J00', name: 'Acute nasopharyngitis [common cold]', description: 'Flu biasa' },
    { code: 'J01', name: 'Acute sinusitis', description: 'Radang sinus' },
    { code: 'J02', name: 'Acute pharyngitis', description: 'Radang tenggorokan' },
    { code: 'J03', name: 'Acute tonsillitis', description: 'Radang amandel' },
    { code: 'J06', name: 'Acute upper respiratory infections', description: 'ISPA' },
    { code: 'J18', name: 'Pneumonia, unspecified organism', description: 'Radang paru' },
    { code: 'J45', name: 'Asthma', description: 'Asma' },
    { code: 'K21', name: 'Gastro-esophageal reflux disease', description: 'GERD' },
    { code: 'K29', name: 'Gastritis and duodenitis', description: 'Maag' },
    { code: 'K35', name: 'Acute appendicitis', description: 'Usus buntu' },
    { code: 'R05', name: 'Cough', description: 'Batuk' },
    { code: 'R50', name: 'Fever of other and unknown origin', description: 'Demam' },
    { code: 'R51', name: 'Headache', description: 'Sakit Kepala' },
    { code: 'T14', name: 'Injury of unspecified body region', description: 'Cedera umum' },
    { code: 'Z00', name: 'General examination without complaint', description: 'Check up' }
];

async function main() {
    console.log('Start seeding ICD-10...');
    for (const item of icd10Data) {
        await prisma.ICD10.upsert({
            where: { code: item.code },
            update: {},
            create: item,
        });
    }
    console.log('Seeding ICD-10 finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
