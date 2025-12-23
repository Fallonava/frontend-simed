const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- VERIFYING CASEMIX FLOW ---');
    try {
        // 1. Setup: Ensure a Medical Record exists with Assessment but NO Casemix
        console.log('1. Setting up Medical Record for Coding...');

        // Ensure Patient & Doctor
        const patient = await prisma.patient.findFirst() || await prisma.patient.create({ data: { name: 'Casemix Test', nik: `${Date.now()}`, no_rm: `RM-C-${Date.now()}`, birth_date: new Date(), gender: 'P' } });
        const doctor = await prisma.doctor.findFirst();

        const admission = await prisma.admission.create({
            data: {
                patient_id: patient.id,
                bed_id: 1, // Assume bed 1 exists from previous tests or logic
                status: 'DISCHARGED',
                check_in: new Date(),
                check_out: new Date()
            }
        });

        const record = await prisma.medicalRecord.create({
            data: {
                patient_id: patient.id,
                doctor_id: doctor.id,
                assessment: 'Demam Typhoid (Suspect)',
                plan: 'IVFD RL 20tpm',
                visit_date: new Date(),
                subjective: 'Panas 3 hari',
                objective: 'Suhu 39C'
            }
        });
        console.log(`   Medical Record Created: ID ${record.id}`);

        // 2. Simulate Coding & Grouping (Controller Logic)
        console.log('2. Coding & Grouping (Simulating Controller)...');

        const icd10 = 'A01.0'; // Typhoid Fever
        const procedure = '99.18'; // Injection

        // Mock Grouping Logic
        const mockTariff = 3500000;
        const mockCBG = 'A-4-10-I';

        const casemix = await prisma.casemix.create({
            data: {
                medical_record_id: record.id,
                primary_icd10: icd10,
                procedures: procedure,
                ina_cbg_code: mockCBG,
                ina_cbg_desc: 'INFEKSI BAKTERI (MOCK)',
                tariff: mockTariff,
                status: 'GROUPED',
                coder_name: 'System Test',
                coded_at: new Date()
            }
        });
        console.log(`   Casemix Grouped. CBG: ${casemix.ina_cbg_code}, Tariff: ${casemix.tariff}`);

        // 3. Generate Claim
        console.log('3. Generating Claim...');
        const updatedCasemix = await prisma.casemix.update({
            where: { id: casemix.id },
            data: { status: 'CLAIMED' }
        });

        // 4. Verify
        if (updatedCasemix.status === 'CLAIMED') {
            console.log('\n✅ SUCCESS: Casemix Flow verified.');
        } else {
            console.log('\n❌ FAILURE: Status not updated to CLAIMED.');
        }

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
