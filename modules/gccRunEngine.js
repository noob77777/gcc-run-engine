const { exec } = require('child_process');
const fs = require('fs');
const constants = require('./constants');

const execShellCommand = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            resolve({ error: error, stdout: stdout, stderr: stderr });
        });
    });
};

const getFile = (key) => {
    return `${constants.TEMP_PATH}/${key}/${key}`;
};

const getPath = (key) => {
    return `${constants.TEMP_PATH}/${key}`;
};

const runSource = async (key) => {
    const cmd = `
ulimit -t ${constants.CPU_TIME_LIMIT}
ulimit -n ${constants.FILE_LIMIT}
ulimit -p ${constants.N_PROCESS_LIMIT}
cat ${getFile(key)}.in | timeout ${constants.MAX_TIMEOUT}s ${getFile(key)}
`;

    const { error, stdout, stderr } = await execShellCommand(cmd);

    if (error) {
        console.log(`error: ${error.message}`);
        return { status: 'ERROR' };
    }

    return { status: 'OK', stdout: stdout, stderr: stderr };
};

const compileSource = async (key, language) => {
    const cmd =
        language === '1'
            ? `
g++ ${getFile(key)}.cpp -o ${getFile(key)} -w
`
            : `
gcc ${getFile(key)}.c -o ${getFile(key)} -w
`;

    const { error, stdout, stderr } = await execShellCommand(cmd);

    if (error) {
        console.log(`error: ${error.message}`);
    }

    return {
        status: 'OK',
        stdout: stdout,
        stderr: stderr,
    };
};

const sourcePreprocess = ({ key, stdin, sourceCode, language }) => {
    try {
        if (!fs.existsSync(getPath(key))) {
            fs.mkdirSync(getPath(key));
        }
        if (stdin) {
            fs.writeFileSync(getFile(key) + '.in', stdin);
        }
        if (sourceCode && language === '1') {
            fs.writeFileSync(getFile(key) + '.cpp', sourceCode);
        }
        if (sourceCode && language === '0') {
            fs.writeFileSync(getFile(key) + '.c', sourceCode);
        }
    } catch (error) {
        console.log(`error: ${error.message}`);
        return { status: 'ERROR' };
    }
    return { status: 'OK' };
};

const checkOutput = (expectedOut, Out) => {
    const filterCallback = (x) => {
        return x !== '';
    };
    const exp = expectedOut.split(/ |\n/).filter(filterCallback);
    const out = Out.split(/ |\n/).filter(filterCallback);
    return JSON.stringify(exp) === JSON.stringify(out);
};

const gccRun = async (request) => {
    const { key, language } = request;
    const result = {
        status: 'OK',
        message: 'Invalid parameters',
        code: 'NA',
        stderr: '',
        stdout: '',
        key: key,
    };

    if (!key || !language) return result;

    if (language === '1' || language === '0') {
        const filesCreated = sourcePreprocess({ ...request });
        result.status = filesCreated.status;
        if (filesCreated.status !== 'OK') {
            result.message = 'Internal file system error';
            return result;
        }

        const compiled = await compileSource(key, language);
        result.status = compiled.status;
        if (compiled.status !== 'OK') {
            result.message = 'Internal system error';
            return result;
        } else if (compiled.stderr) {
            result.message = 'Compilation Error';
            result.code = 'CE';
            result.stderr = compiled.stderr;
            return result;
        }

        const run = await runSource(key);
        result.status = run.status;
        if (run.status !== 'OK') {
            result.message = 'Time Limit Exceeded';
            result.status = 'OK';
            result.code = 'TLE';
            return result;
        } else if (run.stderr) {
            result.message = 'Runtime Error';
            result.code = 'RE';
            result.stderr = run.stderr;
            return result;
        }

        result.code = 'EVAL';
        result.stdout = run.stdout;
        result.message = '';
    }

    return result;
};

const gccCompile = async (request) => {
    const { key, language } = request;
    const result = {
        status: 'OK',
        message: 'Invalid parameters',
        code: 'NA',
        stderr: '',
        key: key,
    };

    if (!key || !language) return result;

    if (language === '1' || language === '0') {
        const filesCreated = sourcePreprocess({ ...request });
        result.status = filesCreated.status;
        if (filesCreated.status !== 'OK') {
            result.message = 'Internal file system error';
            return result;
        }

        const compiled = await compileSource(key, language);
        result.status = compiled.status;
        if (compiled.status !== 'OK') {
            result.message = 'Internal system error';
            return result;
        } else if (compiled.stderr) {
            result.message = 'Compilation Error';
            result.code = 'CE';
            result.stderr = compiled.stderr;
            return result;
        }

        result.code = 'EVAL';
        result.message = '';
    }

    return result;
};

const gccChecker = async (request) => {
    const { key, language } = request;
    const result = {
        status: 'OK',
        message: 'Invalid parameters',
        code: 'NA',
        stderr: '',
        stdout: '',
        key: key,
    };

    if (!key || !language) return result;

    if (language === '1' || language === '0') {
        const filesCreated = sourcePreprocess({ ...request });
        result.status = filesCreated.status;
        if (filesCreated.status !== 'OK') {
            result.message = 'Internal file system error';
            return result;
        }

        const run = await runSource(key);
        result.status = run.status;
        if (run.status !== 'OK') {
            result.message = 'Time Limit Exceeded';
            result.status = 'OK';
            result.code = 'TLE';
            return result;
        } else if (run.stderr) {
            result.message = 'Runtime Error';
            result.code = 'RE';
            result.stderr = run.stderr;
            return result;
        }

        result.code = 'WA';
        result.stdout = run.stdout;
        result.message = 'Wrong Answer';

        if (checkOutput(request.stdout, run.stdout)) {
            result.code = 'AC';
            result.message = 'Correct';
        }
    }

    return result;
};

const rmdir = async (key) => {
    const cmd = `
rm -rf ${getPath(key)}
`;

    const { error } = await execShellCommand(cmd);
    if (error) {
        console.log(`error: ${error.message}`);
    }
};

const deleteKey = async (request) => {
    if (request.key) {
        await rmdir(request.key);
    }
    return { status: 'OK' };
};

const gccRunEngine = async (request) => {
    if (request.requestType === 'run') {
        const result = await gccRun(request);
        return result;
    } else if (request.requestType === 'compile') {
        const result = await gccCompile(request);
        return result;
    } else if (request.requestType === 'check') {
        const result = await gccChecker(request);
        return result;
    } else if (request.requestType === 'delete') {
        const result = await deleteKey(request);
        return result;
    }

    const result = {
        status: 'OK',
        message: 'Invalid parameters',
        key: request.key,
    };
    return result;
};

module.exports = { gccRunEngine: gccRunEngine, rmdir: rmdir };
