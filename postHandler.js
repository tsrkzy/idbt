'use strict';
const {
  promisify: p
} = require('util');
const {
  apiCall
} = require('./apiCall');
const {
  confDirPath,
  readConfig,
  writeConfig,
  readf,
  removef,
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
  const source = await getSource(argv);
  console.log(source);
  if (!source) {
    return false
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

async function getSource(argv) {
  if (argv._[1]) {
    return Promise.resolve(argv._[1]);
  }

  const child_process = require('child_process');
  const editor = argv.emacs ? 'emacs' : 'vi'

  const timestamp = new Date().getTime()
  const tmpFilePath = `${confDirPath}/tmp_${timestamp}`;

  const wordProcessor = child_process.spawn(editor, [tmpFilePath], {
    stdio: 'inherit'
  });
  return new Promise((resolve, reject) => {
    wordProcessor.on('exit', async (e, code) => {
      if (e) {
        reject(e)
      }
      try {
        const draft = await readf(tmpFilePath);
        await removef(tmpFilePath);
        resolve(draft);
      } catch (e) {
        console.log('ABORT posting.');
        resolve('');
      }
    })
  })
}

const postMessage = async (room_id, source) => {

  try {
    const {
      message
    } = await apiCall('/messages', 'POST', {
      room_id,
      source,
      format: 'markdown',
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