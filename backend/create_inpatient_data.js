const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createInpatientData() {
    console.log("🏥 STARTING INPATIENT DATA GENERATION...");

    try {
        // --- 1. Create Rooms & Beds ---
        const roomsToCreate = [
            { name: 'Mawar 01', type: 'VIP', price: 1500000, beds: ['A'] },
            { name: 'Mawar 02', type: 'VIP', price: 1500000, beds: ['A'] },
            { name: 'Melati 01', type: 'KELAS_1', price: 750000, beds: ['A', 'B'] },
            { name: 'Melati 02', type: 'KELAS_1', price: 750000, beds: ['A', 'B'] },
            { name: 'Anggrek 01', type: 'KELAS_2', price: 500000, beds: ['A', 'B', 'C', 'D'] },
            { name: 'Dahlia 01', type: 'KELAS_3', price: 250000, beds: ['A', 'B', 'C', 'D', 'E', 'F'] },
            { name: 'ICU 01', type: 'ICU', price: 2500000, beds: ['A', 'B', 'C'] },
        ];

        let createdBeds = [];

        for (const r of roomsToCreate) {
            let room = await prisma.room.findFirst({
                where: { name: r.name }
            });

            if (!room) {
                room = await prisma.room.create({
                    data: {
                        name: r.name,
                        type: r.type,
                        price: r.price,
                        gender: 'CAMPUR' // Default for now
                    }
                });
                console.log(`✅ Created Room: ${room.name} (${room.type})`);
            }

            // Create Beds
            for (const code of r.beds) {
                let bed = await prisma.bed.findFirst({
                    where: {
                        room_id: room.id,
                        code: code
                    }
                });

                if (!bed) {
                    bed = await prisma.bed.create({
                        data: {
                            room_id: room.id,
                            code: code,
                            status: 'AVAILABLE'
                        }
                    });
                    console.log(`   🛏️ Created Bed: ${room.name} - ${bed.code}`);
                }
                createdBeds.push(bed);
            }
        }


        // --- 2. Create Dummy Patients ---
        const dummyPatients = [
            { name: 'Budi Santoso', nik: '3201011001800001', gender: 'L', birthDate: '1980-01-10', address: 'Jl. Merdeka No. 1', bpjs: true },
            { name: 'Siti Aminah', nik: '3201012005900002', gender: 'P', birthDate: '1990-05-20', address: 'Jl. Sudirman No. 5', bpjs: false },
            { name: 'Agus Setiawan', nik: '3201011508750003', gender: 'L', birthDate: '1975-08-15', address: 'Jl. Gatot Subroto No. 10', bpjs: true },
            { name: 'Ratna Dewi', nik: '3201012512850004', gender: 'P', birthDate: '1985-12-25', address: 'Jl. Ahmad Yani No. 8', bpjs: false },
            { name: 'Joko Widodo', nik: '3201013006610005', gender: 'L', birthDate: '1961-06-21', address: 'Jl. Istana Bogor', bpjs: true },
        ];

        let patients = [];

        for (const p of dummyPatients) {
            let patient = await prisma.patient.findUnique({
                where: { nik: p.nik }
            });

            if (!patient) {
                // Generate dummy RM if needed
                const rm = `00-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}`;

                patient = await prisma.patient.create({
                    data: {
                        name: p.name,
                        nik: p.nik,
                        no_rm: rm,
                        gender: p.gender,
                        birth_date: new Date(p.birthDate),
                        address: p.address,
                        phone: '08123456789',
                        is_bpjs: p.bpjs,
                        bpjs_card_no: p.bpjs ? `000${p.nik.substring(0, 10)}` : null
                    }
                });
                console.log(`✅ Created Patient: ${patient.name} (${patient.no_rm})`);
            }
            patients.push(patient);
        }

        // --- 3. Admit Patients (Active Admissions) ---
        // We will admit the first 3 patients to available beds

        // Filter for available beds first re-fetching to be sure
        const availableBeds = await prisma.bed.findMany({
            where: { status: 'AVAILABLE' }
        });

        if (availableBeds.length < 3) {
            console.log("⚠️ Not enough available beds to admit new patients. Skipping admission creation.");
        } else {
            const patientsToAdmit = patients.slice(0, 3);

            for (let i = 0; i < patientsToAdmit.length; i++) {
                const patient = patientsToAdmit[i];
                const bed = availableBeds[i];

                // Check if patient already admitted
                const existingAdmission = await prisma.admission.findFirst({
                    where: {
                        patient_id: patient.id,
                        status: 'ACTIVE'
                    }
                });

                if (!existingAdmission) {
                    // Create Admission
                    const admission = await prisma.admission.create({
                        data: {
                            patient_id: patient.id,
                            bed_id: bed.id,
                            status: 'ACTIVE',
                            diagnosa_masuk: 'Demam Berdarah Dengue (DBD)', // Dummy diagnosis
                            notes: 'Pasien rawat inap baru.',
                            check_in: new Date()
                        }
                    });

                    // Update Bed Status and Link
                    await prisma.bed.update({
                        where: { id: bed.id },
                        data: {
                            status: 'OCCUPIED',
                            current_patient_id: patient.id
                        }
                    });

                    console.log(`✅ Admitted ${patient.name} to Bed ${bed.code} (ID: ${bed.id})`);
                } else {
                    console.log(`ℹ️ Patient ${patient.name} is already admitted.`);
                }
            }
        }

        console.log("\n🏥 INPATIENT DATA GENERATION COMPLETE!");

    } catch (e) {
        console.error("❌ Error generating inpatient data:", e);
    } finally {
        await prisma.$disconnect();
    }
}

createInpatientData();
