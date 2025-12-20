const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🥗 Starting Nutrition Workflow Verification...");

    // 1. Seed Menus
    console.log("\n[1] Seeding Diet Menus...");
    const menus = [
        { name: 'Nasi Biasa', code: 'NB', type: 'REGULAR', calories: 700 },
        { name: 'Bubur Halus', code: 'BH', type: 'SOFT', calories: 400 },
        { name: 'Diet Diabetes', code: 'DM', type: 'DIET', calories: 500 },
        { name: 'Diet Rendah Garam', code: 'RG', type: 'DIET', calories: 600 },
    ];

    for (const m of menus) {
        await prisma.dietMenu.upsert({
            where: { code: m.code },
            update: {},
            create: m
        });
    }
    console.log("✅ Menus seeded/verified.");

    // 2. Find/Create Active Admission
    console.log("\n[2] Finding Active Inpatient Admission...");
    let admission = await prisma.admission.findFirst({
        where: { status: 'ACTIVE' },
        include: { patient: true, bed: { include: { room: true } } }
    });

    if (!admission) {
        console.log("No active admission found. Creating dummy admission...");
        // Ensure patient exists
        const patient = await prisma.patient.findFirst() || await prisma.patient.create({
            data: {
                name: 'Dummy Nutrition Patient',
                nik: '123123123',
                no_rm: 'RM-NUT-01',
                birth_date: new Date(),
                gender: 'L',
                address: 'Test Address'
            }
        });

        // Ensure Room/Bed exists
        const room = await prisma.room.findFirst() || await prisma.room.create({
            data: { name: 'Mawar 01', type: 'KELAS_3', price: 100000 }
        });
        const bed = await prisma.bed.findFirst({ where: { room_id: room.id } }) || await prisma.bed.create({
            data: { room_id: room.id, code: 'A', status: 'AVAILABLE' }
        });

        admission = await prisma.admission.create({
            data: {
                patient_id: patient.id,
                bed_id: bed.id,
                status: 'ACTIVE'
            },
            include: { patient: true }
        });
    }
    console.log(`✅ Using Admission ID: ${admission.id} (Patient: ${admission.patient.name})`);

    // 3. Nurse Places Order
    console.log("\n[3] Simulating Nurse Ordering Diet...");
    const menu = await prisma.dietMenu.findUnique({ where: { code: 'BH' } }); // Bubur Halus
    const order = await prisma.dietOrder.create({
        data: {
            admission_id: admission.id,
            diet_menu_id: menu.id,
            meal_time: 'LUNCH',
            extras: 'No Telur (Alergi)',
            status: 'ORDERED'
        }
    });
    console.log(`✅ Order Placed: ID ${order.id} | Menu: ${menu.name} | Status: ${order.status}`);

    // 4. Kitchen Views Order (Kitchen Display)
    console.log("\n[4] Simulating Kitchen Display View...");
    const kitchenQueue = await prisma.dietOrder.findMany({
        where: { status: 'ORDERED' },
        include: { diet_menu: true }
    });
    const found = kitchenQueue.find(q => q.id === order.id);
    if (found) console.log(`✅ Order found in Kitchen Queue: ${found.diet_menu.name} - ${found.extras}`);
    else console.error("❌ Order NOT found in Kitchen Queue!");

    // 5. Kitchen Prepares Order
    console.log("\n[5] Kitchen marks as PREPARED...");
    const prepared = await prisma.dietOrder.update({
        where: { id: order.id },
        data: { status: 'PREPARED' }
    });
    console.log(`✅ Status updated to: ${prepared.status}`);

    // 6. Kitchen Delivers Order
    console.log("\n[6] Kitchen marks as DELIVERED...");
    const delivered = await prisma.dietOrder.update({
        where: { id: order.id },
        data: { status: 'DELIVERED' }
    });
    console.log(`✅ Status updated to: ${delivered.status}`);

    console.log("\n🎉 Nutrition Workflow Verification COMPLETE!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
