const asyncRedis = require('async-redis');
const redis = require('redis');
const constants = require('./constants');
const SUBMISSION_QUEUE = 'submission-queue';
const MUTEX = 'mutex';

const redisGetClient = () => {
    const client = asyncRedis.createClient({
        host: constants.REDIS_SERVER,
        post: constants.REDIS_PORT,
    });

    client.on('error', (err) => {
        console.log(`error: ${err}`);
    });

    return client;
};

const redisInit = async (client) => {
    const result = await client.set(MUTEX, 0);
    return result;
};

const redisEnqueue = async (client, value) => {
    const result = await client.lpush(SUBMISSION_QUEUE, value);
    return result;
};

const redisDequeue = async (client) => {
    const result = await client.rpop(SUBMISSION_QUEUE);
    return result;
};

const redisStartProcessing = (client, process) => {
    client.watch(MUTEX, (err) => {
        if (err) {
            throw err;
        }

        client.get(MUTEX, (err, result) => {
            if (err) {
                throw err;
            }
            if (result === 1) {
                client.quit();
                return;
            }

            client
                .multi()
                .incr(MUTEX)
                .exec(async (err, results) => {
                    if (err) {
                        throw err;
                    }
                    if (results === null) {
                        client.quit();
                        return;
                    }

                    await process();

                    client.set(MUTEX, 0, (err, result) => {
                        if (err) {
                            throw err;
                        }
                        client.quit();
                    });
                });
        });
    });
};

const startProcessExclusively = (process) => {
    const tempClient = redis.createClient({
        host: constants.REDIS_SERVER,
        post: constants.REDIS_PORT,
    });
    try {
        redisStartProcessing(tempClient, process);
    } catch (err) {
        tempClient.quit();
        console.log(`error: ${err}`);
    }
};

module.exports = {
    redisGetClient: redisGetClient,
    redisInit: redisInit,
    redisDequeue: redisDequeue,
    redisEnqueue: redisEnqueue,
    startProcessExclusively: startProcessExclusively,
};
