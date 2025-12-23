const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

const satusehatQueue = new Queue('satusehat-sync', {
    connection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 60000 // Start with 1 minute
        },
        removeOnComplete: 100,
        removeOnFail: 500
    }
});

module.exports = { satusehatQueue };
