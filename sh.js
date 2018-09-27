#!/usr/bin/env node

'use strict';
const args = process.argv.slice(2);

const sum = (args) => {
  return args.reduce((sum, v) => {
    return sum + Number(v);
  }, 0);
}

console.reset = () => {
  return console.log('\x1B[2J\x1B[0f');
}

const request = require('request');
const path = 'https://idobata.io/oauth/token';

const method = 'POST';
const body = JSON.stringify({
  "grant_type": "password",
  "username": "tsrmix@gmail.com",
  "password": args[0]
});
const contentType = 'application/json';
const headers = {
  'Content-Type': contentType,
  'Content-Length': Buffer.byteLength(body)
}
const options = {
  url: path,
  method,
  headers,
  body,
}

request(options, (error, response, body) => {
  if (error) console.log(error);
  console.log(response, body);
  console.log('callback');
});

// curl https://idobata.io/oauth/token -H "Content-type: application/json" -d '{"grant_type":"password", "username":"tsrmix@gmail.com", "password":"" }' -x proxy.inb-eplus.jp:8080