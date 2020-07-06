import requests

key = 'ws33xy'
stdin = '1\n'
sourceCode = """
#include<bits/stdc++.h>
#include<unistd.h>
using namespace std;
int x = 2e18;
int main(){
    int n;
    cin >> n;
    cout << n;
    return 0;
}
"""
req = {'language' : '1', 'sourceCode' : sourceCode, 'stdin' : stdin, 'key' : key}

resp = requests.post("http://localhost:3000/api/run_test", req)
print(resp.json())