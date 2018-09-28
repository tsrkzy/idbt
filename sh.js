#!/usr/bin/env node

'use strict';

const {
  initHandler
} = require('./initHandler')
const {
  testHandler
} = require('./testHandler')
const {
  listHandler
} = require('./listHandler')

require('yargs')
  .command({
    command: 'config',
    desc: 'display configure',
    builder: (yargs) => yargs,
    handler: async (argv) => {
      const {
        readConfig,
      } = require('./config');
      const config = await readConfig();
      console.log(config)
    }
  })
  .command({
    command: 'init',
    aliases: ['i'],
    desc: 'configure',
    builder: (yargs) => yargs,
    handler: initHandler,
  })
  .command({
    command: 'test',
    aliases: ['t'],
    desc: 'connection test',
    builder: (yargs) => yargs,
    handler: testHandler,
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
    handler: listHandler
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
  .usage('$0 [init|test|list|post|cancel] [--flags]')
  .help('help')
  .epilogue('need more help? see document on github.')
  .version('v0.1')
  .argv;