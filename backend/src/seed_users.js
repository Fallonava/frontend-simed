const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const users = [
    { username: 'superadmin', role: 'SUPER_ADMIN', name: 'Super Administrator', nip: 'SA-001' },
    { username: 'admin', role: 'ADMIN', name: 'Hospital Administrator', nip: 'ADM-001' },
    { username: 'doctor_aisyah', role: 'DOCTOR', name: 'Dr. Aisyah Sp.A', nip: 'DOC-001', specialist: 'Anak' },
    { username: 'doctor_budi', role: 'DOCTOR', name: 'Dr. Budi Sp.PD', nip: 'DOC-002', specialist: 'Penyakit Dalam' },
    { username: 'front_office', role: 'REGISTRATION', name: 'Front Office Staff', nip: 'FO-001' },
    { username: 'nurse_station', role: 'NURSE', name: 'Nurse Station Unit', nip: 'NS-001' },
    { username: 'pharmacy', role: 'PHARMACIST', name: 'Pharmacy Unit', nip: 'PH-001' },
    { username: 'lab_admin', role: 'LABORATORY', name: 'Laboratorium', nip: 'LAB-001' },
    { username: 'radiology', role: 'RADIOLOGY', name: 'Radiology Unit', nip: 'RAD-001' },
    { username: 'cashier', role: 'CASHIER', name: 'Cashier Staff', nip: 'CS-001' },
    { username: 'hr_manager', role: 'ADMIN', name: 'HR Manager', nip: 'HR-001' },
    { username: 'inventory', role: 'LOGISTICS', name: 'Inventory Manager', nip: 'INV-001' },
    { username: 'kitchen', role: 'KITCHEN', name: 'Kitchen Staff', nip: 'KIT-001' }
];

async function main() {
    console.log('🌱 Seeding Users...');
    const password = await bcrypt.hash('123456', 10);

    for (const u of users) {
        const exist = await prisma.user.findUnique({ where: { username: u.username } });
        if (!exist) {
            // Check if Employee with this NIP already exists to avoid P2002
            const existingEmployee = await prisma.employee.findUnique({ where: { nip: u.nip } });

            if (existingEmployee) {
                console.log(`⚠️ Employee with NIP ${u.nip} exists. Linking to new user...`);
                // Create user and link to existing employee (or just create user without employee creation if complex)
                const newUser = await prisma.user.create({
                    data: {
                        username: u.username,
                        password,
                        role: u.role,
                        employee: {
                            connect: { id: existingEmployee.id }
                        }
                    }
                });
                console.log(`✅ Created user: ${u.username} (${u.role}) Linked to existing NIP.`);
            } else {
                const newUser = await prisma.user.create({
                    data: {
                        username: u.username,
                        password,
                        role: u.role,
                        employee: {
                            create: {
                                full_name: u.name,
                                nip: u.nip,
                                role: u.role
                            }
                        }
                    }
                });
                console.log(`✅ Created user: ${u.username} (${u.role})`);
            }

            // If Doctor, create Doctor table entry too for linking
            if (u.role === 'DOCTOR') {
                // Check if doctor entry exists by NIP or Name logic if strictly needed, 
                // but typically the Doctor table might be separate from User/Employee in this schema.
                // Let's assume Employee is enough for Login, but Doctor table is needed for Queue.

                // Note: Schema has explicit Doctor model separate from Employee currently. 
                // We will create a Doctor record linked to a simplified Poliklinik for testing.

                // Find or Create Poliklinik General
                let poli = await prisma.poliklinik.findFirst();
                if (!poli) {
                    poli = await prisma.poliklinik.create({
                        data: { name: 'Poli Umum', queue_code: 'A' }
                    });
                }

                await prisma.doctor.create({
                    data: {
                        name: u.name,
                        specialist: u.specialist || 'General',
                        poliklinik_id: poli.id
                    }
                });
                console.log(`   -> Linked Doctor Record: ${u.name}`);
            }

        } else {
            console.log(`ℹ️ User ${u.username} already exists.`);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
