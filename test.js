const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('response', (data) => {
    console.log(data);
    if (data.key === 'testzp3e') {
    }
});

const sourceCode = `
#include<stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int x = 0;
    for(int i = 0; i < n; i++) {
        x++;
    }
    printf("%d %d", x, n);
    return 0;
}
`;
const key = 'testzp3e';
const language = '0';
const stdin = `
10000000
`;
const stdout = `10000000 10000000`;

const request = {
    requestType: 'delete',
    sourceCode: sourceCode,
    stdin: stdin,
    stdout: stdout,
    key: key,
    language: language,
};

for (let i = 0; i < 1; i++) {
    socket.emit('request', { ...request, key: 'the' });
}
