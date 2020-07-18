const { gccRunEngine, rmdir } = require('./gccRunEngine');
const { io } = require('./Common');
const {
    redisGetClient,
    redisDequeue,
    redisEnqueue,
    startProcessExclusively,
} = require('./submissionQueue');

const startGCCRunEngine = async () => {
    const client = redisGetClient();
    let data = await redisDequeue(client);
    while (data !== null) {
        data = JSON.parse(data);

        const request = data.request;
        const response = await gccRunEngine(request);
        
        if (request.key && request.requestType === 'run') {
            await rmdir(request.key);
        }
 
        io.to(data.client_id).emit('response', response);
        data = await redisDequeue(client);
    }
    await client.quit();
};

const handleSocketRequest = async (data) => {
    const client = redisGetClient();
    await redisEnqueue(client, JSON.stringify(data));
    startProcessExclusively(startGCCRunEngine);
    await client.quit();
};

module.exports = { handleSocketRequest: handleSocketRequest };
