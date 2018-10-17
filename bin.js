#!/usr/bin/env node

'use strict';

const {
  initHandler
} = require('./initHandler');
const {
  channelHandler
} = require('./channelHandler');
const {
  testHandler
} = require('./testHandler');
const {
  listHandler
} = require('./listHandler');
const {
  postHandler
} = require('./postHandler');
const {
  cancelHandler
} = require('./cancelHandler');

require('yargs')
  .command({
    command: 'init',
    aliases: ['i'],
    desc: 'initialize = get tokens, create config files.\nyou must hit this after install.',
    builder: (yargs) => yargs,
    handler: initHandler,
  })
  .command({
    command: 'config',
    desc: 'show configure values.',
    builder: (yargs) => yargs,
    handler: async (argv) => {
      const {
        readConfig,
      } = require('./config');
      const config = await readConfig();
      console.log(config);
    }
  })
  .command({
    command: 'channel',
    aliases: ['c'],
    desc: 'change current channel.',
    builder: (yargs) => yargs,
    handler: channelHandler,
  })
  .command({
    command: 'test',
    aliases: ['t'],
    desc: 'connection test.',
    builder: (yargs) => yargs,
    handler: testHandler,
  })
  .command({
    command: 'list',
    aliases: ['l'],
    desc: 'show timeline.',
    builder: (yargs) => yargs
      .option('channel', {
        alias: 'c',
        describe: '@WIP specify target channel',
        type: 'string'
      })
      .group('channel', 'Flags:')
      .example('$0 list', 'show CURRENT timeline'),
    handler: listHandler
  })

  .command({
    command: 'post',
    aliases: ['p'],
    desc: 'create new post. use stdin or open vim/emacs.',
    builder: (yargs) => yargs
      .option('channel', {
        alias: 'c',
        describe: '@WIP specify target channel',
        type: 'string'
      })
      .option('yes', {
        alias: 'y',
        describe: '@WIP mode "yesman". no longer confirm before posting.',
        type: 'boolean'
      })
      .option('file', {
        alias: 'f',
        describe: '@WIP read from file',
        default: '~/.idbt/draft.md',
        type: 'string'
      })
      .option('emacs', {
        alias: 'e',
        describe: 'open emacs. (need emacs installation, of course!)',
        type: 'boolean'
      })
      .group(['channel', 'yes', 'file'], 'Flags:')
      .example('$0 post', 'open vim. saving texts, post it to CURRENT channel. quit (:q!) to abort.')
      .example('$0 post "hello"', 'post hello to CURRENT channel.'),
    // .example('$0 post --yes "hello!"', 'post "hello!" to CURRENT channel')
    // .example('$0 post -y --channel hogehoge "hello!"', 'post "hello!" to channel hogehoge')
    // .example('$0 post -y --file ./draft.txt', 'post $(cat ./draft.txt) to CURRENT channel'),
    handler: postHandler,
  })
  .command({
    command: 'draft',
    aliases: ['d'],
    desc: '@WIP SORRY, UNDER DEVELOPMENT!',
    builder: (yargs) => yargs,
    handler: (argv) => {
      console.log('$(idbt draft) executed with', argv);
    }
  })
  .command({
    command: 'cancel',
    aliases: ['undo'],
    desc: '@WIP delete your latest post.',
    builder: (yargs) => yargs
      .option('yes', {
        alias: 'y',
        describe: 'mode "yesman". no longer confirm before deletion.',
        type: 'boolean'
      })
      .group(['yes'], 'Flags:')
      .example('$0 cancel', 'delete your last post start with "****"'),
    handler: cancelHandler,
  })
  .usage('$0 [init|test|list|post] [--flags]')
  .help('help')
  .epilogue('need more help? see document on npm.\nhttps://www.npmjs.com/package/idbt')
  .version('v0.1')
  .argv;