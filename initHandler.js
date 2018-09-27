'use strict';
const {
  promisify: p
} = require('util');
const path = require('path');
const homeDirPath = require('os').homedir();
const confDirPath = path.join(homeDirPath, '.idbt');
const confFilePath = path.join(confDirPath, 'config');
const draftFilePath = path.join(confDirPath, 'draft.md');
const fs = require('fs');
const {
  open,
  close
} = fs;
const fopen = p(open);
const fclose = p(close);
const mkdirp = p(require('mkdirp'));

module.exports = (argv) => {
  mkdirp(confDirPath)
    .then(() => {
      console.log('mkdir ok! :', confDirPath);
      // まず読み込みモードで開く。失敗する→存在しない
      fopen(confFilePath, 'r')
        .then((fd) => {
          console.log('already exists', fd);
        })
        .catch(() => {
          console.log('');
        })

    }).catch((e) => {
      console.log('init failed!');
      throw e
    })
  console.log('$(idbt list) executed with', argv);
}