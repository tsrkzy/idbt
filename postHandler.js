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

const postHandler = async (argv) => {
  const config = await readConfig();
  const {
    current
  } = config

  if (!current) {
    console.log('No current channel FOUND.');
    return false;
  }

  const {
    id: room_id,
    name: roomName
  } = current;
  const source = argv._[1];
  if (!source) {
    /* TODO */
  }

  /* DEBUG STOPPER */
  if (room_id !== 6340) {
    console.log("カレントチャンネルがテスト用のものではありません");
    return false;
  }

  const lastPostInfo = await postMessage(room_id, source);

  try {
    config.last = lastPostInfo;
    await writeConfig(config);
  } catch (e) {
    console.log(`FAILED to save latest post.`)
  }
}

const postMessage = async (room_id, source) => {
  try {
    const {
      message
    } = await apiCall('/messages', 'POST', {
      room_id,
      source
    })
    const last = {
      id: message.id,
      created_at: message.created_at,
      body: message.body,
      raw: source,
      room_id: message.room_id,
    }

    return last
  } catch (e) {
    console.log(e);
  }
}

exports.postHandler = postHandler;