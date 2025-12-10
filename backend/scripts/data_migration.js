const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const DUMP_FILE = path.join(__dirname, '../data_dump.json');

async function exportData() {
    console.log('Starting data export...');
    const data = {};

    try {
        // List of models to export (order matters for valid foreign keys later if we were doing raw sql, 
        // but with prisma create inputs we handle relations differently or just correct order)
        // Actually, simple export/import of raw data works best if we disable constraints or insert in order.
        // Let's rely on reading all data first.

        // Independent tables first
        data.users = await prisma.user.findMany();
        data.polikliniks = await prisma.poliklinik.findMany();
        data.counters = await prisma.counter.findMany();
        data.playlists = await prisma.playlist.findMany();
        data.settings = await prisma.setting.findMany();

        // Dependent tables
        data.doctors = await prisma.doctor.findMany(); // depends on poliklinik
        data.dailyQuotas = await prisma.dailyQuota.findMany(); // depends on doctor
        data.doctorSchedules = await prisma.doctorSchedule.findMany(); // depends on doctor
        data.doctorLeaves = await prisma.doctorLeave.findMany(); // depends on doctor
        data.queues = await prisma.queue.findMany(); // depends on dailyQuota

        console.log('Data fetched. Writing to file...');
        fs.writeFileSync(DUMP_FILE, JSON.stringify(data, null, 2));
        console.log(`Data exported successfully to ${DUMP_FILE}`);
    } catch (error) {
        console.error('Export failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function importData() {
    console.log('Starting data import...');

    if (!fs.existsSync(DUMP_FILE)) {
        console.error('Dump file not found!');
        return;
    }

    const data = JSON.parse(fs.readFileSync(DUMP_FILE, 'utf-8'));

    try {
        // Clear existing data (optional, but good for clean slate if migration runs multiple times)
        // Note: cascade delete might be needed, or delete in reverse order
        // But since this is a new DB, it should be empty.

        // Import in order of dependency

        console.log('Importing Users...');
        for (const item of data.users) {
            await prisma.user.create({ data: item });
        }

        console.log('Importing Counters...');
        for (const item of data.counters) {
            await prisma.counter.create({ data: item });
        }

        console.log('Importing Playlists...');
        for (const item of data.playlists) {
            await prisma.playlist.create({ data: item });
        }

        console.log('Importing Settings...');
        for (const item of data.settings) {
            await prisma.setting.create({ data: item });
        }

        console.log('Importing Polikliniks...');
        for (const item of data.polikliniks) {
            await prisma.poliklinik.create({ data: item });
        }

        console.log('Importing Doctors...');
        for (const item of data.doctors) {
            // Need to ensure foreign keys match. IDs are preserved if we specify them.
            await prisma.doctor.create({ data: item });
        }

        console.log('Importing Doctor Schedules...');
        for (const item of data.doctorSchedules) {
            await prisma.doctorSchedule.create({ data: item });
        }

        console.log('Importing Doctor Leaves...');
        for (const item of data.doctorLeaves) {
            await prisma.doctorLeave.create({ data: item });
        }

        console.log('Importing Daily Quotas...');
        for (const item of data.dailyQuotas) {
            await prisma.dailyQuota.create({ data: item });
        }

        console.log('Importing Queues...');
        for (const item of data.queues) {
            await prisma.queue.create({ data: item });
        }

        console.log('Data import completed successfully!');
    } catch (error) {
        console.error('Import failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

const action = process.argv[2];
if (action === 'export') {
    exportData();
} else if (action === 'import') {
    importData();
} else {
    console.log('Usage: node scripts/data_migration.js [export|import]');
}
