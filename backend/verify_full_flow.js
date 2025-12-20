const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:3000/api';

// Utilities
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const log = (step, msg, data = '') => console.log(`[${step}] ${msg}`, data ? JSON.stringify(data, null, 2) : '');

async function verifyFullFlow() {
    console.log("🚀 Starting Full End-to-End Verification Flow...");

    try {
        // --- PREPARATION ---
        const uniqueId = Date.now().toString().slice(-6);

        // 1. Create Data (Patient, Doctor, Medicine)
        log('SETUP', 'Creating Prerequisite Data...');

        const patient = await prisma.patient.create({
            data: {
                name: `Test Pasien ${uniqueId}`,
                nik: `123456789${uniqueId}`,
                no_rm: `RM-${uniqueId}`,
                gender: 'L',
                birth_date: new Date('1990-01-01'),
                phone: '08123456789',
                address: 'Jl. Test Integration'
            }
        });
        log('SETUP', 'Patient Created', { id: patient.id, name: patient.name });

        // Ensure a Poliklinik exists
        const poli = await prisma.poliklinik.upsert({
            where: { queue_code: 'TES' },
            create: { name: 'Poli Test', queue_code: 'TES' },
            update: {}
        });

        // Ensure Doctor exists
        const doctor = await prisma.doctor.upsert({
            where: { id: 99999 }, // Mock ID
            create: { name: 'Dr. Integration', specialist: 'Umum', poliklinik_id: poli.id },
            update: {} // Assume existing is fine
        });

        // Ensure Medicine exists
        const medicine = await prisma.medicine.upsert({
            where: { code: `MED-${uniqueId}` },
            create: {
                name: `Obat Test ${uniqueId}`,
                code: `MED-${uniqueId}`,
                stock: 100,
                unit: 'Strip',
                price: 5000
            },
            update: {}
        });
        log('SETUP', 'Prerequisites Ready');


        // --- STEP 1: REGISTRATION (Simulated via Queue) ---
        log('STEP 1', 'Patient Registration / Queueing...');
        // Usually done via POST /queues, but we'll use Prisma for speed as queue logic is verified elsewhere
        // But let's create a MedicalRecord shell as "Registration" result often leads to a visit
        // In this flow, Doctor creates MR usually, or Registration creates MR in 'WAITING' state. 
        // We'll create the MR directly to simulate "Active Visit".

        const visit = await prisma.medicalRecord.create({
            data: {
                patient_id: patient.id,
                doctor_id: doctor.id,
                visit_date: new Date(),
                subjective: "Sakit Kepala",
                objective: "TD 120/80",
                assessment: "", // Not yet done
                plan: ""
            }
        });
        log('STEP 1', 'Patient Registered & Visit Started', { visit_id: visit.id });


        // --- STEP 2: DOCTOR CONSULTATION (Ordering Lab/Rad/Meds) ---
        log('STEP 2', 'Doctor Checks & Orders...');

        // 2a. Order Lab
        const labOrder = await prisma.serviceOrder.create({
            data: {
                medical_record_id: visit.id,
                type: 'LAB',
                status: 'PENDING',
                notes: 'Cek Darah Lengkap'
            }
        });

        // 2b. Order Rad
        const radOrder = await prisma.serviceOrder.create({
            data: {
                medical_record_id: visit.id,
                type: 'RAD',
                status: 'PENDING',
                notes: 'Rontgen Thorax'
            }
        });

        // 2c. Prescribe Medicine
        // Use API to test controller logic for stock validation
        // POST /prescriptions
        // Need to Mock IO for controller if needed? Controller uses req.io. 
        // We are hitting DB directly for Lab/Rad but Prescriptions are complex. 
        // Let's use Prisma for simplicity and reliability of FLOW data, assuming Controllers work (verified previously).

        const prescription = await prisma.prescription.create({
            data: {
                medical_record_id: visit.id,
                doctor_id: doctor.id,
                patient_id: patient.id,
                status: 'PENDING',
                notes: 'Minum rutin',
                items: {
                    create: [{
                        medicine_id: medicine.id,
                        quantity: 10,
                        dosage: '3x1'
                    }]
                }
            }
        });

        // 2d. Doctor Finishes (Update MR)
        await prisma.medicalRecord.update({
            where: { id: visit.id },
            data: {
                assessment: 'Hipertensi Grade 1',
                plan: 'Istirahat, Minum Obat'
            }
        });
        log('STEP 2', 'Orders Placed (Lab, Rad, Meds)');


        // --- STEP 3: FULFILLMENT (Lab, Rad, Pharmacy) ---
        log('STEP 3', 'Fulfilling Orders...');

        // 3a. Lab Result
        await prisma.serviceOrder.update({
            where: { id: labOrder.id },
            data: { status: 'COMPLETED', result: 'Hb: Normal, Leu: Normal' }
        });

        // 3b. Rad Result
        await prisma.serviceOrder.update({
            where: { id: radOrder.id },
            data: { status: 'COMPLETED', result: 'Cor/Pulmo dalam batas normal' }
        });

        // 3c. Pharmacy Process
        // Pending -> Completed
        await prisma.prescription.update({
            where: { id: prescription.id },
            data: { status: 'COMPLETED' } // Assuming stock deducted by triggered hook or separate manual deduction if simple
        });

        log('STEP 3', 'All Orders Completed');


        const jwt = require('jsonwebtoken');

        // --- STEP 3.5: AUTHENTICATION (Generate Token Directly) ---
        log('STEP 3.5', 'Generating Auth Token...');

        // Ensure Admin User Exists
        const adminUser = await prisma.user.upsert({
            where: { username: 'admin_test' },
            create: { username: 'admin_test', password: 'password123', role: 'ADMIN' },
            update: {}
        });

        // Generate Token directly to bypass password hashing requirement in script
        const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
        const token = jwt.sign(
            { id: adminUser.id, username: adminUser.username, role: adminUser.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
        log('STEP 3.5', 'Token Generated', { token: token.substring(0, 20) + '...' });


        // --- STEP 4: BILLING (Invoice Generation) ---
        log('STEP 4', 'Generating Invoice...');

        // Call the API endpoint logic directly or simulate it
        // We will call the actual endpoint using AXIOS to test the Controller Logic
        try {
            const invoiceRes = await axios.post(`${API_URL}/transactions/invoice`, {
                medical_record_id: visit.id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const invoice = invoiceRes.data;
            log('STEP 4', 'Invoice Generated', {
                invoice_no: invoice.invoice_no,
                total: invoice.total_amount,
                items: invoice.items
            });

            // --- VERIFICATION POINT ---
            let errors = [];
            const itemDescs = invoice.items.map(i => i.description.toLowerCase());

            // Check Lab
            if (!itemDescs.some(d => d.includes('lab') || d.includes('darah'))) {
                errors.push("MISSING: Lab Fee in Invoice");
            }
            // Check Rad
            if (!itemDescs.some(d => d.includes('rad') || d.includes('rontgen') || d.includes('x-ray'))) {
                errors.push("MISSING: Radiology Fee in Invoice");
            }
            // Check Meds
            if (!itemDescs.some(d => d.includes('obat') || d.includes(medicine.name.toLowerCase()))) {
                errors.push("MISSING: Medicine Fee in Invoice");
            }
            // Check Doctor
            if (!itemDescs.some(d => d.includes('jasa dokter'))) {
                errors.push("MISSING: Doctor Fee in Invoice");
            }

            if (errors.length > 0) {
                console.error("❌ INVOICE VERIFICATION FAILED:");
                errors.forEach(e => console.error(`   - ${e}`));

                // FORCE FAIL TO PROMPT FIX
                // Ideally we return here, but for the script we continue to show flow
                console.log("⚠️ Proceeding to Payment Test despite invoice errors (for flow check)...");
            } else {
                console.log("✅ Invoice Verification PASSED: All items present.");
            }

            // --- STEP 5: PAYMENT ---
            log('STEP 5', 'Processing Payment...');
            const payRes = await axios.put(`${API_URL}/transactions/${invoice.id}/pay`, {
                payment_method: 'CASH'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const updatedTrans = payRes.data;

            if (updatedTrans.status === 'PAID') {
                log('STEP 5', 'Payment Successful', { status: updatedTrans.status });
            } else {
                console.error('STEP 5 FAILED: Status is ' + updatedTrans.status);
            }

        } catch (err) {
            console.error('API Error during Billing/Payment:', err.response ? err.response.data : err.message);
        }

    } catch (e) {
        console.error("CRITICAL SCRIPT ERROR:", e);
    } finally {
        await prisma.$disconnect();
    }
}

verifyFullFlow();
