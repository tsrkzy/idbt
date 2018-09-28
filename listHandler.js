'use strict';
const {
  promisify: p
} = require('util');
const {
  apiCall
} = require('./apiCall');
const {
  readConfig,
} = require('./config');

const listHandler = async (argv) => {
  const config = await readConfig();
  const {
    current
  } = config;

  if (!current) {
    console.log('NO current channel FOUND.');
    return false;
  }

  const uri = current.links.messages;
  const {
    messages
  } = await apiCall(uri);


  const list = [];
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const message = {
      id: m.id,
      senderName: m.sender_name,
      senderIconUrl: m.sender_icon_url,
      createdAt: m.created_at,
      html: m.body,
      senderId: m.sender_id,
    }
    list.push(message);
  }
  console.log(list);
}

exports.listHandler = listHandler;