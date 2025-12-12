const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper: Parse time string "08.00 - 14.00" to minutes from midnight
const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split('.').map(Number);
    return hours * 60 + minutes;
};

// Helper: Check if current time is within range
const isWithinTime = (timeRangeStr) => {
    if (!timeRangeStr) return false;

    // Normalize string (remove spaces, handle "Selesai")
    const range = timeRangeStr.toLowerCase().replace(/\s/g, '');

    // Handle "Selesai" (Finished) - usually implies until end of day or specific logic
    // For now, let's assume "Selesai" means until 23:59 if it's the end time

    const parts = range.split('-');
    if (parts.length !== 2) return false; // Invalid format

    const startStr = parts[0];
    let endStr = parts[1];

    if (endStr.includes('selesai')) {
        endStr = '23.59';
    }

    // Extract time parts (e.g., "08.00" -> 08, 00)
    // Regex to match HH.MM or HH:MM
    const timeRegex = /(\d{1,2})[.:](\d{2})/;

    const startMatch = startStr.match(timeRegex);
    const endMatch = endStr.match(timeRegex);

    if (!startMatch || !endMatch) return false;

    const startMinutes = parseInt(startMatch[1]) * 60 + parseInt(startMatch[2]);
    const endMinutes = parseInt(endMatch[1]) * 60 + parseInt(endMatch[2]);

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

const initScheduler = (io) => {
    console.log('Initializing Scheduler...');

    // Run every minute
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const dayOfWeek = now.getDay() || 7; // 0=Sun (convert to 7), 1=Mon...6=Sat
        // Adjust Sunday to 7 if your DB uses 1-7 (Mon-Sun) or 0-6. 
        // Based on seed.js: 1=Senin, ... 6=Sabtu. Sunday might be 7 or 0.
        // Let's assume standard JS: 0=Sun, 1=Mon. 
        // Seed data uses 1=Senin. So JS Day 1 = DB Day 1. JS Day 0 (Sun) = DB Day 7 (if applicable).

        const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;

        try {
            const doctors = await prisma.doctor.findMany({
                include: {
                    schedules: true,
                    DailyQuota: {
                        where: {
                            date: {
                                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                                lt: new Date(new Date().setHours(23, 59, 59, 999))
                            }
                        }
                    }
                }
            });

            for (const doc of doctors) {
                // 1. Ensure DailyQuota exists
                let quota = doc.DailyQuota[0];
                if (!quota) {
                    // Create quota if it doesn't exist (Auto-load)
                    // Only create if there is a schedule for today
                    const hasScheduleToday = doc.schedules.some(s => s.day === dbDay);

                    if (hasScheduleToday) {
                        // CHECK FOR LEAVE
                        const isOnLeave = await prisma.doctorLeave.findUnique({
                            where: {
                                doctor_id_date: {
                                    doctor_id: doc.id,
                                    date: new Date(new Date().setHours(0, 0, 0, 0))
                                }
                            }
                        });

                        if (!isOnLeave) {
                            quota = await prisma.dailyQuota.create({
                                data: {
                                    doctor_id: doc.id,
                                    date: new Date(new Date().setHours(0, 0, 0, 0)),
                                    max_quota: 30, // Default
                                    status: 'OPEN' // Initialize as OPEN per user request "live buka"
                                }
                            });
                            console.log(`[Scheduler] Created quota for ${doc.name}`);
                        } else {
                            console.log(`[Scheduler] Skipped quota for ${doc.name} (On Leave)`);
                        }
                    }
                }

                if (quota) {
                    // 3. Update Status
                    // User Request: "Logic not based on hour but on day"
                    // If it is the doctor's day, they should be OPEN.

                    const schedulesToday = doc.schedules.filter(s => s.day === dbDay);

                    if (schedulesToday.length > 0) {
                        // It is their day. Ensure they are OPEN (unless manually set to BREAK/CLOSED?)
                        // "Live status live buka adalah dokter yang praktek pada hari itu"
                        // We will enforce OPEN if currently CLOSED. 
                        // We respect BREAK if manually set.

                        // CHECK FOR LEAVE AGAIN (in case it was added later)
                        const isOnLeave = await prisma.doctorLeave.findUnique({
                            where: {
                                doctor_id_date: {
                                    doctor_id: doc.id,
                                    date: new Date(new Date().setHours(0, 0, 0, 0))
                                }
                            }
                        });

                        if (!isOnLeave && quota.status === 'CLOSED') {
                            const updated = await prisma.dailyQuota.update({
                                where: { id: quota.id },
                                data: { status: 'OPEN' },
                                include: { doctor: true }
                            });

                            io.emit('status_update', updated);
                            console.log(`[Scheduler] Updated ${doc.name} to OPEN (Day Match)`);
                        } else if (isOnLeave && quota.status !== 'CLOSED') {
                            // Force close if on leave
                            const updated = await prisma.dailyQuota.update({
                                where: { id: quota.id },
                                data: { status: 'CLOSED' },
                                include: { doctor: true }
                            });
                            io.emit('status_update', updated);
                            console.log(`[Scheduler] Updated ${doc.name} to CLOSED (On Leave)`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[Scheduler] Error:', error);
        }
    });
};

module.exports = initScheduler;
