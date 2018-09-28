'use strict';
const request = require('request');
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

exports.initHandler = async (argv) => {

  await checkConfigFileState();

  const {
    username,
    password
  } = await authPrompt();

  let accessToken;
  try {
    accessToken = await fetchToken(username, password)
  } catch (e) {
    console.log(e);
    console.log('CANNOT get token. check your network proxy or credencial.');
    return false;
  }

  let user;
  let organizations;
  let rooms;
  try {
    user = await fetchUserInfo()
    organizations = await fetchOrganizationInfo()
    rooms = await fetchRoomInfo(user.id)
  } catch (e) {
    console.log(e)
    console.log('FAILED fetching organization/rooms info. check your network.');
  }

  try {
    await writeConfig({
      username,
      accessToken,
      user,
      organizations,
      rooms,
    })
  } catch (e) {
    console.log(e);
    console.log('FAILED saving organization/rooms info.');
  }
}

async function fetchUserInfo() {
  const {
    users
  } = await apiCall('/users');
  let user = {};
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    if (!u.hasOwnProperty('email')) continue;

    user = {
      id: u.id,
      name: u.name,
    }
    break;
  }
  return user;
}

async function fetchOrganizationInfo() {
  const {
    organizations
  } = await apiCall('/organizations');
  let myOrganizations = [];
  for (let i = 0; i < organizations.length; i++) {
    const o = organizations[i];
    const organization = {
      id: o.id,
      name: o.name,
      slug: o.slug,
      links: o.links,
    }
    myOrganizations.push(organization);
  }

  return myOrganizations;
}

async function fetchRoomInfo(userId) {
  const {
    joins,
    rooms,
  } = await apiCall('/rooms')

  const myJoinIds = [];
  const guyId = userId;
  for (let i = 0; i < joins.length; i++) {
    const join = joins[i];
    if (join.guy_id !== guyId) continue;

    myJoinIds.push(join.id)
  }

  const myRooms = [];
  for (let i = 0; i < rooms.length; i++) {
    const r = rooms[i];
    const {
      join_ids
    } = r
    for (let j = 0; j < join_ids.length; j++) {
      const joinId = join_ids[j];
      if (myJoinIds.indexOf(joinId) === -1) continue;

      const room = {
        id: r.id,
        name: r.name,
        links: r.links,
      }
      myRooms.push(room);
      break;
    }
  }

  return myRooms;
}

async function authPrompt() {
  const inquirer = require('inquirer')
  const answers = await inquirer
    .prompt([{
      type: 'input',
      name: 'username',
      message: 'email:',
      validate: (input) => {
        const trimmed = input.trim();
        if (trimmed.length === 0) {
          return false;
        }

        /* @REF HTML5 input[type=email] willful violation against RFC5322 */
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
        return emailPattern.test(trimmed)
      }
    }, {
      type: 'password',
      name: 'password',
      message: 'password (will not be kept anywhere):',
      validate: (input) => {
        const trimmed = input.trim();
        return trimmed.length !== 0
      }
    }])

  return answers
}

async function fetchToken(username, password) {
  const request_p = p(request);
  const path = 'https://idobata.io/oauth/token';

  const method = 'POST';
  const jsonStr = JSON.stringify({
    "grant_type": "password",
    username,
    password
  });
  const contentType = 'application/json';
  const headers = {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(jsonStr)
  }
  const options = {
    url: path,
    method,
    headers,
    body: jsonStr,
  }

  const res = await request_p(options)
  const {
    body
  } = res;
  const {
    access_token
  } = JSON.parse(body)

  if (!access_token) {
    throw new Error('authentication FAILED.')
  }

  const config = await readConfig();
  config.email = username;
  config.accessToken = access_token;
  await writeConfig(config);

  return access_token;
}