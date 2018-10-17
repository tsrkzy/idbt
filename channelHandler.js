'use strict';
const {
  promisify: p
} = require('util');
const {
  apiCall
} = require('./apiCall');
const {
  roomSelectPrompt
} = require('./initHandler');

const channelHandler = async (argv) => {
  await roomSelectPrompt();
};

exports.channelHandler = channelHandler;