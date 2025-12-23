const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding DMF Templates...');

    // 1. ICU Hourly Observation Sheet
    const icuTemplate = await prisma.formTemplate.upsert({
        where: { code: 'FORM-ICU-01' },
        update: {},
        create: {
            name: 'ICU Hourly Flowsheet',
            code: 'FORM-ICU-01',
            category: 'ICU',
            description: 'Hourly tracking of vital signs and life support for critical care.',
            schema: {
                fields: [
                    { name: 'systolic', label: 'Systolic (mmHg)', type: 'number', required: true, width: '1/4' },
                    { name: 'diastolic', label: 'Diastolic (mmHg)', type: 'number', required: true, width: '1/4' },
                    { name: 'hr', label: 'Heart Rate (bpm)', type: 'number', required: true, width: '1/4' },
                    { name: 'rr', label: 'Resp Rate (x/min)', type: 'number', required: true, width: '1/4' },
                    { name: 'spo2', label: 'SpO2 (%)', type: 'number', required: true, width: '1/4' },
                    { name: 'temp', label: 'Temperature (C)', type: 'number', required: true, width: '1/4' },
                    { name: 'gcs', label: 'GCS Score', type: 'number', required: false, width: '1/4' },
                    { name: 'urine_output', label: 'Urine Output (ml)', type: 'number', required: false, width: '1/4' },
                    { name: 'vent_mode', label: 'Ventilator Mode', type: 'select', options: ['SIMV', 'CPAP', 'PEEP', 'ASV', 'BIPAP'], width: '1/2' },
                    { name: 'peep', label: 'PEEP', type: 'number', width: '1/4' },
                    { name: 'fio2', label: 'FiO2 (%)', type: 'number', width: '1/4' },
                    { name: 'notes', label: 'Clinical Notes', type: 'textarea', width: 'full' }
                ]
            }
        }
    });

    // 2. IBS Surgical Safety Checklist (WHO)
    const ibsTemplate = await prisma.formTemplate.upsert({
        where: { code: 'FORM-IBS-01' },
        update: {},
        create: {
            name: 'WHO Surgical Safety Checklist',
            code: 'FORM-IBS-01',
            category: 'IBS',
            description: 'Mandatory safety checks before, during, and after surgery.',
            schema: {
                sections: [
                    {
                        title: 'SIGN IN (Before Induction)',
                        fields: [
                            { name: 'identity_confirmed', label: 'Patient Identity confirmed?', type: 'checkbox' },
                            { name: 'site_marked', label: 'Site marked?', type: 'checkbox' },
                            { name: 'anesthesia_safety_check', label: 'Anesthesia Safety Check completed?', type: 'checkbox' },
                            { name: 'pulse_oximeter', label: 'Pulse Oximeter on patient and functioning?', type: 'checkbox' }
                        ]
                    },
                    {
                        title: 'TIME OUT (Before Skin Incision)',
                        fields: [
                            { name: 'team_introduced', label: 'All team members introduced themselves?', type: 'checkbox' },
                            { name: 'confirm_patient_name', label: 'Surgeon, Anesthetist, Nurse confirm patient name?', type: 'checkbox' },
                            { name: 'antibiotic_prophylaxis', label: 'Antibiotic prophylaxis given in last 60 mins?', type: 'select', options: ['Yes', 'No', 'N/A'] }
                        ]
                    }
                ]
            }
        }
    });

    console.log('DMF Templates seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
