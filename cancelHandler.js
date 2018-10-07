'use strict';
const {
  readConfig,
  writeConfig,
} = require('./config');
const {
  apiCall
} = require('./apiCall');

const cancelHandler = async (argv) => {
  const config = await readConfig();
  const {
    last
  } = config;

  if (!last) {
    console.log('CANNOT FOUND last post data.');
    return false;
  }

  const {
    id,
    created_at,
    body,
    raw,
    room_id,
  } = last;
  const path = `/messages/${id}`;

  try {
    await apiCall(path, 'DELETE');
    config.last = null;
    await writeConfig(config);
    console.log('deleted SUCCESSFULLY.');
  } catch (e) {
    console.log('FAILED to delete.');
  }
};
exports.cancelHandler = cancelHandler;