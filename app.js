const express = require('express');
const constants = require('./modules/constants');
const { gccRunEngine, rmdir } = require('./modules/gccRunEngine');

const app = express();
const port = constants.PORT;
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('{ name : "gccRunEngine" }'));
app.post('/api/run_test/', async (req, res) => {
    const result = await gccRunEngine(req.body);
    if (req.body.key) {
        await rmdir(req.body.key);
    }
    res.send(result);
});

app.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
);
