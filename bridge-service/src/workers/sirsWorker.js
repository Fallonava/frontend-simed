const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const SIRSMapper = require('../mappers/sirsMapper');
const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

const sirsWorker = new Worker('sirs-reporting', async (job) => {
    const { reportType, month, year } = job.data;
    logger.info(`Generating SIRS report`, { reportType, month, year });

    try {
        let reportData;

        switch (reportType) {
            case 'RL2':
                reportData = await SIRSMapper.calculateRL2();
                break;
            case 'RL3':
                reportData = await SIRSMapper.calculateRL3(month, year);
                break;
            case 'RL4':
                reportData = await SIRSMapper.calculateRL4(month, year);
                break;
            default:
                throw new Error(`Unsupported report type: ${reportType}`);
        }

        // In a real scenario, we would send this to SIRS Online API via axios
        // For now, we log the success and save to IntegrationLog

        await prisma.integrationLog.create({
            data: {
                system: 'SIRS',
                resource_type: reportType,
                resource_id: 0, // General report
                status: 'SUCCESS',
                request_body: job.data,
                response_body: reportData
            }
        });

        logger.info(`Successfully generated ${reportType} for ${month}/${year}`);
        return reportData;
    } catch (error) {
        logger.error(`Failed to generate SIRS report`, error);

        await prisma.integrationLog.create({
            data: {
                system: 'SIRS',
                resource_type: reportType,
                resource_id: 0,
                status: 'FAILED',
                error_message: error.message
            }
        });

        throw error;
    }
}, { connection });

module.exports = sirsWorker;
