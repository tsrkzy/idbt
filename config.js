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
  unlink,
} = fs;
const p_open = p(open);
const p_close = p(close);
const p_writeFile = p(writeFile)
const p_readFile = p(readFile)
const p_unlink = p(unlink);
const mkdirp = p(require('mkdirp'));

exports.confDirPath = confDirPath
exports.checkConfigFileState = async () => {
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
    console.log(`CANNOT access ${confFilePath}`);
    return false;
  }

  try {
    await p_open(draftFilePath, 'w')
  } catch (e) {
    console.log(e);
    console.log(`CANNOT access ${draftFilePath}`);
    return false;
  }
}

exports.readConfig = async () => {
  try {
    const jsonStr = await p_readFile(confFilePath, {
      encoding: 'utf8',
      flag: 'r'
    })
    const trimmed = jsonStr.trim();
    const json = JSON.parse(trimmed || '{}')
    return json
  } catch (e) {
    console.log(e);
    console.log(`CANNOT read ${confFilePath}.`);
    throw e
  }
}

exports.writeConfig = async (jsonObject) => {
  try {
    await p_writeFile(confFilePath, JSON.stringify(jsonObject))
  } catch (e) {
    console.log(e)
    console.log(`CANNOT write configs to ${confFilePath}.`)
    throw e
  }
}

exports.readf = async (filePath) => {
  try {
    const fileContent = await p_readFile(filePath, {
      encoding: 'utf8',
      flag: 'r'
    })
    return fileContent
  } catch (e) {
    throw e
  }
}

exports.removef = async (filePath) => {
  try {
    await p_unlink(filePath, )
  } catch (e) {
    throw e
  }
}