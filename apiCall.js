'use strict'
const {
  readConfig,
} = require('./config');

exports.apiCall = async (path, method = 'GET', jsonObject) => {
  const {
    promisify: p
  } = require('util');
  const request = require('request');

  const request_p = p(request);
  const {
    accessToken
  } = await readConfig();

  const url = /^https?/.test(path) ? path : `https://idobata.io/api${path}`;
  const headers = {
    'X-API-Token': accessToken,
    'User-Agent': 'idbt',
  }
  const options = {
    url,
    method,
    headers,
  }

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(jsonObject);
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