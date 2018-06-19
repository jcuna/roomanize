/**
 * Created by jgarcia on 10/7/16.
 */

import 'whatwg-fetch';
const fetchJsonp = require('fetch-jsonp');
const urlEncode = require('query-string');

/**
 *
 * @param {string} url
 * @param {object} method
 * @param {object} data
 * @param {boolean} crossDomain
 * @param {object} headers
 * @returns {Promise}
 */
const normalFetch = (url, method, data, crossDomain, headers = {}) => {
    headers = { ...headers, 'Content-Type': 'application/json' };

    const request = {
        headers,
        method,
        credentials: 'same-origin',
        body: JSON.stringify(data),
    };

    return new Promise((resolve, reject) => {
        let status;

        return fetch(url, request).then(response => {
            const contentType = response.headers.get('content-type');

            status = response.status;
            if (contentType && contentType.indexOf('application/json') !== -1) {
                return response.json().then(resp => {
                    resolve({ data: resp, status });
                }, (error) => {
                    reject({ error, status, });
                });
            }
            return reject('invalid contentType');
        }, (error) => {
            reject(error);
        });
    });
};

/**
 *
 * @param {string} url
 * @param {data} data
 * @returns {Promise}
 */
const jsonpFetch = function (url, data) {
    const queryString = urlEncode.stringify(data);

    url = url + '?' + queryString;
    return fetchJsonp(url).then(response => {
        return response.json();
    });
};

/**
 *
 * @param {object} request
 * @param {object} data
 * @param {boolean} jsonp
 * @returns {Promise}
 */
const api = (request, data = null, jsonp = false) => {

    const URL_PREFIX = '/api/v1.0';

    let url = request.url;
    const crossDomain = url.indexOf('http') === 0;
    const method = typeof request.method === 'undefined' ? 'GET' : request.method;

    if (url.indexOf('/') !== 0 && !crossDomain) {
        url = '/' + url;
    }
    url = URL_PREFIX + url;

    if (jsonp) {
        return jsonpFetch(url, data);
    }
    return normalFetch(url, method, data, crossDomain, request.headers);
};

export default api;
