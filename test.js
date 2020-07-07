const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('response', (data) => {
    console.log(data);
});

const sourceCode = `
#include<bits/stdc++.h>
using namespace std;
int main() {
    int n;
    cin >> n;
    int x = 0;
    for(int i = 0; i < n; i++) {
        x++;
    }
    cout << n << ' ' << x << endl;
    return 0;
}
`;
const key = 'testzp3e';
const language = '1';
const stdin = `
10000000
`;

const request = {
    sourceCode: sourceCode,
    key: key,
    language: language,
    stdin: stdin,
};

for (let i = 0; i < 100; i++) {
    socket.emit('request', { ...request, key: i+1 });
}
