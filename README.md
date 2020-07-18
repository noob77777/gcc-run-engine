# gcc-run-engine <br />

## api <br />
### Uses `socket.io` for all connections.
1. `run` => { requestType: 'run', key, sourceCode, stdin, language }
2. `compile` => { requestType: 'compile', key, sourceCode, language }
3. `check` => { requestType: 'check', key, stdin, stdout, language }
4. `delete` => { requestType: 'delete', key }

### Compilers: g++ for .cpp and gcc for .c files. <br />

### `npm install`
Install all dependencies.

### `node app.js`
Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `node test.js`
Runs the testing script

### Deployment
Deployed with Google Cloud Compute Engine.<br />
Deployment branch is v1.0
