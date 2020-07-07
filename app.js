const express = require('express');
const constants = require('./modules/constants');
const { handleSocketRequest } = require('./modules/socketHandlers');
const { app, server, io } = require('./modules/Common');
const port = constants.PORT;

app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => res.send('{ name : "gccRunEngine" }'));

io.on('connection', (client) => {
    console.log('Connected ' + client.id);

    client.on('request', (data) => {
        handleSocketRequest({ request: data, client_id: client.id });
    });
});

server.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
);
