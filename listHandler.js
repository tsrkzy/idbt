'use strict';
const request = require('request');
const inquirer = require('inquirer')
const {
  promisify: p
} = require('util');
const {
  apiCall
} = require('./apiCall');
const {
  checkConfigFileState,
  readConfig,
  writeConfig
} = require('./config');

const listHandler = async (argv) => {
  console.log(argv);

}

exports.listHandler = listHandler;