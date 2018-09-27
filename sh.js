#!/usr/bin/env node

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

require('yargs')
  .command({
    command: 'init',
    aliases: ['i'],
    desc: 'configure',
    builder: (yargs) => yargs,
    handler: (argv) => {
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
  })
  .command({
    command: 'test',
    aliases: ['t'],
    desc: 'connection test',
    builder: (yargs) => yargs,
    handler: (argv) => {
      console.log('connection test executed', argv);
    }
  })
  .command({
    command: 'list',
    aliases: ['l'],
    desc: 'show timeline',
    builder: (yargs) => yargs
      .option('channel', {
        alias: 'c',
        describe: 'specify target channel',
        type: 'string'
      })
      .group('channel', 'Flags:')
      .example('$0 list', 'show CURRENT timeline')
      .example('$0 list --channel hogehoge', 'show timeline of channel hogehoge'),
    handler: (argv) => {
      console.log('$(idbt list) executed with', argv);
    }
  })
  .command({
    command: 'draft',
    aliases: ['d'],
    desc: false,
    builder: (yargs) => yargs,
    handler: (argv) => {
      console.log('$(idbt draft) executed with', argv);
    }
  })
  .command({
    command: 'post',
    aliases: ['p'],
    desc: 'create new post',
    builder: (yargs) => yargs
      .option('channel', {
        alias: 'c',
        describe: 'specify target channel',
        type: 'string'
      })
      .option('yes', {
        alias: 'y',
        describe: 'mode "yesman". no longer confirm before posting.',
        type: 'boolean'
      })
      .option('file', {
        alias: 'f',
        describe: 'read from file',
        default: '~/.idbt/draft.md',
        type: 'string'
      })
      .group(['channel', 'yes', 'file'], 'Flags:')
      .example('$0 post "hello!"', 'post "hello!" to CURRENT channel? (y/n)')
      .example('$0 post --yes "hello!"', 'post "hello!" to CURRENT channel')
      .example('$0 post -y --channel hogehoge "hello!"', 'post "hello!" to channel hogehoge')
      .example('$0 post -y --file ./draft.txt', 'post $(cat ./draft.txt) to CURRENT channel'),
    handler: (argv) => {
      console.log('$(idbt post) executed with', argv);
    }
  })
  .command({
    command: 'cancel',
    aliases: ['undo'],
    desc: 'delete latest your post',
    builder: (yargs) => yargs
      .option('yes', {
        alias: 'y',
        describe: 'mode "yesman". no longer confirm before deletion.',
        type: 'boolean'
      })
      .group(['yes'], 'Flags:')
      .example('$0 cancel', 'delete your last post start with "****"')
      .example('$0 cancel --yes', 'delete your last post start with "****"? (y/n)'),
    handler: (argv) => {
      console.log('$(idbt post) executed with', argv);
    }
  })
  .example('$0 list', 'list example')
  .usage('$0 [init|test|list|post|cancel] [--flags]')
  .help('help')
  .epilogue('need more help? see document on github.')
  .version('1.0.0')
  .argv;

// const request = require('request');
// const path = 'https://idobata.io/oauth/token';

// const method = 'POST';
// const body = JSON.stringify({
//   "grant_type": "password",
//   "username": "tsrmix@gmail.com",
//   "password": args[0]
// });
// const contentType = 'application/json';
// const headers = {
//   'Content-Type': contentType,
//   'Content-Length': Buffer.byteLength(body)
// }
// const options = {
//   url: path,
//   method,
//   headers,
//   body,
// }

// request(options, (error, response, body) => {
//   if (error) {
//     // console.log(error)
//     console.log('error');
//     return false;
//   };
//   // console.log(response, body);
//   console.log('success');
// });

// // curl https://idobata.io/oauth/token -H "Content-type: application/json" -d '{"grant_type":"password", "username":"tsrmix@gmail.com", "password":"" }' -x proxy.inb-eplus.jp:8080