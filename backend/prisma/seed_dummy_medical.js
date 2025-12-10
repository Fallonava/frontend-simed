const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Dummy Data Seeding...');

    // 1. Ensure Medicines Exist
    const medicinesData = [
        { name: 'Paracetamol 500mg', code: 'MED001', category: 'Tablet', stock: 100, unit: 'strips', price: 5000 },
        { name: 'Amoxicillin 500mg', code: 'MED002', category: 'Antibiotic', stock: 50, unit: 'strips', price: 15000 },
        { name: 'Vitamin C 500mg', code: 'MED003', category: 'Vitamin', stock: 200, unit: 'bottle', price: 25000 },
        { name: 'OBH Combi', code: 'MED004', category: 'Syrup', stock: 30, unit: 'bottle', price: 12000 },
        { name: 'CTM', code: 'MED005', category: 'Tablet', stock: 100, unit: 'strips', price: 2000 },
    ];

    for (const med of medicinesData) {
        await prisma.medicine.upsert({
            where: { code: med.code },
            update: {},
            create: med,
        });
    }
    console.log('✅ Medicines seeded.');

    // 2. Get Doctors and Patients
    const doctors = await prisma.doctor.findMany();
    const patients = await prisma.patient.findMany();

    if (doctors.length === 0 || patients.length === 0) {
        console.error('❌ Please ensure you have Doctors and Patients in the database first.');
        return;
    }

    const doctor = doctors[0];
    const patient = patients[0];

    // 3. Create Medical Records & Prescriptions
    const complaints = ['Demam tinggi', 'Batuk berdahak', 'Sakit kepala', 'Pusing mual', 'Gatal-gatal'];
    const diagnoses = ['Febris', 'ISPA', 'Cephalgia', 'Dyspepsia', 'Dermatitis'];

    for (let i = 0; i < 5; i++) {
        const medRecord = await prisma.medicalRecord.create({
            data: {
                patient_id: patient.id,
                doctor_id: doctor.id,
                subjective: complaints[i],
                objective: `TD: 120/80, N: 80, S: 36.${i}`,
                assessment: diagnoses[i],
                plan: 'Istirahat cukup, minum obat',
                systolic: 120,
                diastolic: 80,
                heart_rate: 80 + i,
                temperature: 36.5 + (i * 0.1),
                weight: 60 + i,
                height: 170,
                created_at: new Date(new Date().setDate(new Date().getDate() - i)) // Past dates
            }
        });

        // Create Prescription for this record
        const allMeds = await prisma.medicine.findMany();
        await prisma.prescription.create({
            data: {
                medical_record_id: medRecord.id,
                doctor_id: doctor.id,
                patient_id: patient.id,
                status: i % 2 === 0 ? 'PENDING' : 'COMPLETED', // Alternate status
                items: {
                    create: [
                        {
                            medicine_id: allMeds[0].id,
                            quantity: 1,
                            dosage: '3x1'
                        },
                        {
                            medicine_id: allMeds[1].id,
                            quantity: 2,
                            dosage: '2x1'
                        }
                    ]
                }
            }
        });
    }

    console.log('✅ Dummy Medical Records & Prescriptions created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
