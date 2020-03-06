'use strict'

import Logger from '../../logger'
import axios from 'axios'
import uuid from 'uuid/v4'
import chipiAuth from '../auth'
const rax = require('retry-axios')

const axiosInterceptorId = rax.attach();
const correlationItemPrefix = 'x-correlation-';
let logger = new Logger('ChipiRequest')

const defaultRequestRaxConfig = {
  retry: 2,
  noResponseRetries: 2,
  retryDelay: 1000
}

/**
 * Send http get request
 *
 * @param  {Object} options
 * @param  {String} authToken User's id_token return from Chipi platform
 */
// options: {
//    url     : string,
//    headers : object,
//    params  : object
//  }
function get(options, authToken) {
  options.method = 'get';

  return sendRequest(options, authToken);
}

/**
 * Send http post request
 *
 * @param  {Object} options
 * @param  {String} authToken User's id_token return from Chipi platform
 */
// options: {
//    url     : string,
//    headers : object,
//    params  : object,
//    data    : object
//  }
function post(options, authToken) {
  options.method = 'post';

  return sendRequest(options, authToken);
}

/**
 * Send http request
 *
 * @param  {Object} options
 * @param  {String} authToken User's id_token return from Chipi platform
 */
// options: {
//    url     : string,
//    headers : object,
//    params  : object,
//    data    : object
//  }
function put(options, authToken) {
  options.method = 'put';

  return sendRequest(options, authToken);
}

/**
 * Send http request
 *
 * @param  {Object} options
// options: {
//    url     : string,
//    method  : get (default) | post | put | head,
//    headers : object,
//    params  : object,
//    data    : object,
//    raxConfig : object (retry-axios based request retry configs)
//  }
 * @param  {String} authToken User's id_token return from Chipi platform
 */
function sendRequest(options, authToken) {
  logger.debug('Request option received', options)

  if (!options) {
    throw new Error('no HTTP request options is provided')
  }

  if (!options.url) {
    throw new Error('no HTTP url is specified')
  }

  if (!options.headers || !options.headers['Content-Type']) {
    options.headers = Object.assign({}, options.headers, { 'Content-Type': 'application/json;charset=UTF-8' });
  }

  if (authToken) {
    options.headers = Object.assign({}, options.headers, { Authorization: authToken });
  }

  if (!options.raxConfig) {
    options.raxConfig = defaultRequestRaxConfig
  }

  //Add correlation id to the Chipi request
  options.headers[`${correlationItemPrefix}correlationId`] = uuid();

  options.baseUrl = options.url

  options.data = typeof options.data !== 'string' ? JSON.stringify(options.data) : options.data

  const fullResponse = options.resolveWithFullResponse === true;

  logger.debug('Request options', options);

  return axios.request(options)
    .then(r => fullResponse ? r : r.data)
    .catch(e => {
      logger.error('Failed to generate request object', e)
      if (e.response && e.response.error) {
        throw e.response.error
      }

      throw e
    })
}

export default { get, put, post }
