'use strict';
const {
  promisify: p
} = require('util');
const path = require('path');
const homeDirPath = require('os').homedir();
const confDirPath = path.join(homeDirPath, '.idbt');
const confFilePath = path.join(confDirPath, 'config.json');
const draftFilePath = path.join(confDirPath, 'draft.md');
const fs = require('fs');
const {
  open,
  close,
  writeFile,
  readFile,
} = fs;
const p_open = p(open);
const p_close = p(close);
const p_writeFile = p(writeFile)
const p_readFile = p(readFile)
const mkdirp = p(require('mkdirp'));

module.exports = async (argv) => {

  await checkConfigFileState();

  /* 対話形式でメールアドレスとパスワードを入力し、トークンを取得 */
  const {
    username,
    access_token
  } = await authPrompt();

  await writeConfig({
    username,
    access_token
  })

  /* メールアドレスに紐づく所属、更にその所属に紐づくチャネルを取得 */

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

  const {
    username,
    password
  } = answers

  const request = require('request');
  const request_p = p(request);
  const path = 'https://idobata.io/oauth/token';

  const method = 'POST';
  const body = JSON.stringify({
    "grant_type": "password",
    username,
    password
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

  try {
    const res = await request_p(options)
    const {
      body
    } = res;
    const {
      access_token
    } = JSON.parse(body)
    console.log(`authentication succeed. token: ${access_token}`);

    return {
      username,
      access_token
    }
  } catch (e) {
    console.log('authentication FAILED.');
    console.log(e);
  }
}

async function checkConfigFileState() {
  /* ディレクトリ(~/.idbt)の作成 */
  try {
    await mkdirp(confDirPath)
    console.log(`mkdir ${confDirPath} well done.`);
  } catch (e) {
    console.log(`mkdir ${confFilePath} already exists.`);
  }

  /* 設定ファイル(~/.idbt/config)とドラフトファイル(~/.idbt/draft.md)が書込み不可なら終了 */
  try {
    await p_open(confFilePath, 'w')
  } catch (e) {
    console.log(e);
    console.log(`cannot access ${confFilePath}`);
    return false;
  }

  try {
    await p_open(draftFilePath, 'w')
  } catch (e) {
    console.log(e);
    console.log(`cannot access ${draftFilePath}`);
    return false;
  }
}

async function readConfig() {
  try {
    const jsonStr = await p_readFile(confFilePath, {
      encoding: 'utf8',
      flag: 'r'
    })
    const json = JSON.parse(jsonStr)
    return json
  } catch (e) {
    console.log(e);
    throw e
  }
}

async function writeConfig(jsonObject) {
  try {
    await p_writeFile(confFilePath, JSON.stringify(jsonObject))
  } catch (e) {
    console.log(e)
    throw e
  }
}