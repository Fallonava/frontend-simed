const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugQueue() {
    console.log('🔍 DEBUGGING QUEUE SYNC...');
    const now = new Date();
    console.log(`🕒 Server Time: ${now.toLocaleString()}`);

    try {
        // 1. Get ALL Waiting Queues (Raw)
        const allPending = await prisma.queue.findMany({
            where: { status: 'WAITING' },
            include: { daily_quota: true, patient: true }
        });

        console.log(`\n📋 Found ${allPending.length} TOTAL WAITING records in DB:`);

        allPending.forEach(q => {
            console.log(`   - [ID: ${q.id}] ${q.queue_code} | Patient: ${q.patient.name} | QuotaDate: ${q.daily_quota.date.toLocaleString()} | PoliID: ${q.daily_quota.doctor_id} (Wait, need poli join)`);
        });

        // 2. Simulate the Controller Logic
        const startOf24h = new Date(new Date().getTime() - 24 * 60 * 60 * 1000); // Back 24h
        const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));

        console.log(`\n🧹 FILTER logic:`);
        console.log(`   Start: ${startOf24h.toLocaleString()}`);
        console.log(`   End:   ${endOfToday.toLocaleString()}`);

        const filtered = await prisma.queue.findMany({
            where: {
                status: { in: ['WAITING', 'CALLED'] },
                daily_quota: {
                    date: {
                        gte: startOf24h,
                        lt: endOfToday
                    }
                }
            }
        });

        console.log(`\n✅ Controller Query would return: ${filtered.length} records.`);
        if (filtered.length === 0 && allPending.length > 0) {
            console.log('❌ MISMATCH DETECTED! Use the dates above to fix the controller logic.');
        } else if (filtered.length > 0) {
            console.log('✅ Logic match. If frontend is empty, check network/frontend code.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

debugQueue();
