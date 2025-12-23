const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

const sirsQueue = new Queue('sirs-reporting', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'fixed',
            delay: 300000 // 5 minutes
        }
    }
});

module.exports = { sirsQueue };
