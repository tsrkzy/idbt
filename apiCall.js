'use strict';
const { readConfig, } = require('./config');
const request = require('request');
const { promisify: p } = require('util');

exports.apiCall = async (path, method = 'GET', jsonObject) => {

  const request_p = p(request);
  const { accessToken } = await readConfig();

  const url = /^https?/.test(path) ? path : `https://idobata.io/api${path}`;
  const headers = {
    'X-API-Token': accessToken,
    'User-Agent': 'idbt',
  };
  const options = {
    url,
    method,
    headers,
  };

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(jsonObject);
  }

  try {
    const res = await request_p(options);
    const {
      statusCode,
      statusMessage,
      body
    } = res;
    if (statusCode >= 400) {
      throw new Error(statusMessage);
    }
    const json = JSON.parse(body);

    return json;
  } catch (e) {
    console.log(e);
    throw e;
  }
};