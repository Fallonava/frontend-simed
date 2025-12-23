const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const sisruteClient = require('../integrations/sisrute');
const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

const sisruteWorker = new Worker('sisrute-referral', async (job) => {
    const { action, data } = job.data;
    logger.info(`Processing SISRUTE job: ${action}`, { data });

    try {
        if (action === 'process-incoming-referral') {
            // 1. Log incoming referral
            await prisma.integrationLog.create({
                data: {
                    system: 'SISRUTE',
                    resource_type: 'IncomingReferral',
                    resource_id: data.id || 0,
                    status: 'PENDING',
                    request_body: data,
                }
            });

            // 2. Auto-check bed availability for the requested type (e.g. ICU)
            // Expecting data.perkiraan_layanan (e.g. "Rawat Inap", "ICU")
            const bedType = data.perkiraan_layanan?.toUpperCase().includes('ICU') ? 'ICU' : 'KELAS_1'; // Simplified logic

            const availableBeds = await prisma.bed.count({
                where: {
                    room: { type: bedType },
                    status: 'AVAILABLE'
                }
            });

            // 3. Prepare response
            const response = {
                status: availableBeds > 0 ? 'Diterima' : 'Dicuci/Penuh',
                keterangan: availableBeds > 0
                    ? `Tersedia ${availableBeds} tempat tidur ${bedType}`
                    : `Maaf, kategori ${bedType} sedang penuh.`
            };

            // 4. Send response back to SISRUTE
            const result = await sisruteClient.sendResponse(data.id, response);

            // 5. Update log
            await prisma.integrationLog.updateMany({
                where: {
                    system: 'SISRUTE',
                    resource_id: data.id,
                    status: 'PENDING'
                },
                data: {
                    status: 'SUCCESS',
                    response_body: { internal_check: response, sisrute_response: result }
                }
            });

            logger.info(`Processed incoming referral ${data.id}. Response: ${response.status}`);
            return result;
        }

        if (action === 'sync-beds') {
            // General bed status update to SISRUTE
            const roomStats = await prisma.room.findMany({
                include: { _count: { select: { beds: { where: { status: 'AVAILABLE' } } } } }
            });

            const payload = roomStats.map(r => ({
                kode_ruang: r.id,
                nama_ruang: r.name,
                kapasitas: r.beds.length,
                tersedia: r._count.beds
            }));

            const result = await sisruteClient.updateBedAvailability(payload);
            return result;
        }

    } catch (error) {
        logger.error(`Failed to process SISRUTE job: ${action}`, error);
        throw error;
    }
}, { connection });

module.exports = sisruteWorker;
