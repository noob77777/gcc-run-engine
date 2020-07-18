const { exec } = require('child_process');
const fs = require('fs');
const constants = require('./constants');
const LOG = require('./Logger.js');

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
        //console.log(`error: ${error.message}`);
        LOG.LOG(`error: ${error.message}`);
        return { status: 'ERROR' };
    }

    return { status: 'OK', stdout: stdout, stderr: stderr };
};

const compileSource = async (key) => {
    const cmd = `
g++ ${getFile(key)}.cpp -o ${getFile(key)} -w
`;
    const { error, stdout, stderr } = await execShellCommand(cmd);

    if (error) {
        //console.log(`error: ${error.message}`);
        LOG.LOG(`error: ${error.message}`);
    }

    return {
        status: 'OK',
        stdout: stdout,
        stderr: stderr,
    };
};

const sourcePreprocess = (key, stdin, sourceCode) => {
    try {
        fs.mkdirSync(getPath(key));
        fs.writeFileSync(getFile(key) + '.in', stdin);
        fs.writeFileSync(getFile(key) + '.cpp', sourceCode);
    } catch (error) {
        //console.log(`error: ${error.message}`);
        LOG.LOG(`error: ${error.message}`);
        return { status: 'ERROR' };
    }
    return { status: 'OK' };
};

const gccRunEngine = async (request) => {
    const { key, language, stdin, sourceCode } = request;
    const result = {
        status: 'OK',
        message: 'Invalid parameters',
        code: 'NA',
        stderr: '',
        stdout: '',
        key: key,
    };

    if (!key || !language) return result;

    if (language === '1') {
        const filesCreated = sourcePreprocess(key, stdin, sourceCode);
        result.status = filesCreated.status;
        if (filesCreated.status !== 'OK') {
            result.message = 'Internal file system error';
            return result;
        }

        const compiled = await compileSource(key);
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

const rmdir = async (key) => {
    const cmd = `
rm -rf ${getPath(key)}
`;

    const { error } = await execShellCommand(cmd);
    if (error) {
        //console.log(`error: ${error.message}`);
        LOG.LOG(`error: ${error.message}`);
    }
};

module.exports = { gccRunEngine: gccRunEngine, rmdir: rmdir };
