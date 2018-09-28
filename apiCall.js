'use strict'
const {
  readConfig,
} = require('./config');

exports.apiCall = async (path) => {
  const {
    promisify: p
  } = require('util');
  const request = require('request');

  const request_p = p(request);
  const {
    accessToken
  } = await readConfig();

  const method = 'GET';
  const url = `https://idobata.io/api${path}`;
  const headers = {
    'X-API-Token': accessToken,
    'User-Agent': 'idbt',
  }
  const options = {
    url,
    method,
    headers,
  }

  try {
    const res = await request_p(options)
    const {
      body
    } = res;
    const json = JSON.parse(body);
    if (!json) {
      throw new Error('API returns null.')
    }

    return json
  } catch (e) {
    console.log(e);
    throw e
  }
}