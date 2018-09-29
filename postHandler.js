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
  console.log(argv);
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

  const param = {
    room_id,
    source
  }

  /* DEBUG STOPPER */
  if (room_id !== 6340) {
    console.log("カレントチャンネルがテスト用のものではありません");
    return false;
  }

  try {
    const res = await apiCall('/messages', 'POST', param)
    console.log(res);
  } catch (e) {
    console.log(e);
  }
}
// "message": {
//   "id": 28197291,
//   "sender_name": "k_tashiro",
//   "sender_icon_url": "https://idobata.s3.amazonaws.com/uploads/user/icon/7524/elderSign.jpg",
//   "created_at": "2018-09-29T12:08:28.670Z",
//   "body": "<div>hogefuga</div>",
//   "sender_id": 7524,
//   "sender_type": "User",
//   "room_id": 6340
// }
exports.postHandler = postHandler;