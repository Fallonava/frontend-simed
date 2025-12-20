const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- VERIFYING NUTRITION WORKFLOW ---');
    try {
        // 1. Setup Diet Menus (Master Data)
        console.log('1. Setting up Diet Menus...');
        let menuRegular = await prisma.dietMenu.findFirst({ where: { name: 'Regular' } });
        if (!menuRegular) {
            menuRegular = await prisma.dietMenu.create({ data: { name: 'Regular', type: 'STANDARD', description: 'Standard balanced diet', calories: 2000 } });
            await prisma.dietMenu.create({ data: { name: 'Bubur Halus', type: 'SOFT', description: 'Soft porridge for digestion', calories: 1500 } });
            console.log('   Created Default Menus.');
        }

        // 2. Setup Active Patient (Admission)
        console.log('2. Setting up Active Patient...');
        const room = await prisma.room.findFirst() || await prisma.room.create({ data: { name: 'Melati 1' } });
        const bed = await prisma.bed.findFirst({ where: { room_id: room.id } }) || await prisma.bed.create({ data: { room_id: room.id, code: '01', status: 'AVAILABLE' } });

        // Ensure bed is available
        await prisma.bed.update({ where: { id: bed.id }, data: { status: 'AVAILABLE', current_patient_id: null } });

        const patient = await prisma.patient.findFirst() || await prisma.patient.create({ data: { name: 'Patient Diet Test', no_rm: 'DT001' } });

        // Create Admission
        const admission = await prisma.admission.create({
            data: {
                patient_id: patient.id,
                bed_id: bed.id,
                status: 'ACTIVE',
                diagnosa_masuk: 'Gastritis'
            }
        });
        // Update Bed to Occupied
        await prisma.bed.update({ where: { id: bed.id }, data: { status: 'OCCUPIED', current_patient_id: patient.id } });
        console.log(`   Admitted ${patient.name} to Bed ${bed.code}.`);

        // 3. Nurse Places Order (Simulate Controller)
        console.log('3. Nurse placing order...');
        const orderData = {
            admission_id: admission.id,
            diet_menu_id: menuRegular.id,
            meal_time: 'LUNCH',
            extras: 'No Spicy',
            status: 'ORDERED'
        };

        const order = await prisma.dietOrder.create({ data: orderData });
        console.log(`   Order Placed: ${order.meal_time} - ${menuRegular.name} (ID: ${order.id})`);

        // 4. Kitchen View (Fetch Active Orders)
        console.log('4. Kitchen fetching orders...');
        const kitchenOrders = await prisma.dietOrder.findMany({
            where: { status: 'ORDERED' },
            include: { diet_menu: true, admission: { include: { patient: true } } }
        });

        const found = kitchenOrders.find(o => o.id === order.id);
        if (found) {
            console.log(`   ✅ Verified: Kitchen sees order for ${found.admission.patient.name}`);
        } else {
            console.error('   ❌ FAILED: Order not found in Kitchen Queue.');
        }

        // 5. Cleanup (Discharge for data hygiene)
        await prisma.admission.update({ where: { id: admission.id }, data: { status: 'DISCHARGED', check_out: new Date() } });
        await prisma.bed.update({ where: { id: bed.id }, data: { status: 'CLEANING', current_patient_id: null } });
        console.log('   Cleanup: Patient Discharged.');

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
