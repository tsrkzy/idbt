#!/usr/bin/env node

'use strict';
const args = process.argv.slice(2);

function sum(args) {
  return args.reduce((sum, v) => {
    return sum + Number(v);
  }, 0);
}

console.reset = () => {
  return console.log('\x1B[2J\x1B[0f');
}


let i = 0;
const index = setInterval(() => {
  console.reset();
  console.log(i);
  i++;
}, 1000)