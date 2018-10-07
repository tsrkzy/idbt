'use strict';
const spinner = require('cli-spinners');
const chalk = require('chalk');

exports.spin = ({ msg = '', type = 'dots' }, asyncFunction) => new Promise((resolve) => {
  let i = 0;
  const { [type]: sp } = spinner;
  const { frames, interval } = sp;
  const id = setInterval(() => {
    process.stdout.write(`\r${chalk.red(frames[i % (frames.length)])}${msg}`);
    i++;
  }, interval);
  return asyncFunction()
    .then((value) => {
      clearInterval(id);
      console.log('\r');
      resolve(value);
    }).catch((e) => {
      clearInterval(id);
      throw e;
    });
});