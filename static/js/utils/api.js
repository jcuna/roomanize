/**
 * Created by jgarcia on 10/7/16.
 */

import 'whatwg-fetch';
import { API_PREFIX, API_VERSION } from '../constants';
import fetchJsonp from 'fetch-jsonp';
import urlEncode from 'query-string';

/**
 *
 * @param {string} url
 * @param {object} method
 * @param {object} data
 * @param {boolean} crossDomain
 * @param {object} headers
 * @param {boolean} omitContentType
 * @returns {Promise}
 */
const normalFetch = (url, method, data, crossDomain, headers = {}, omitContentType) => {
    if (!headers['Content-Type'] && !omitContentType) {
        headers = { ...headers, 'Content-Type': 'application/json' };
    }

    const request = {
        headers,
        method,
        credentials: 'same-origin',
        body: headers['Content-Type'] === 'application/json' ? JSON.stringify(data) : data,
    };

    return new Promise((resolve, reject) =>
        fetch(url, request).then(response => {
            const contentType = response.headers.get('content-type');
            if (contentType === 'application/json') {
                return response.json().then(resp => {
                    if (response.status < 300) {
                        resolve({ data: resp, status: response.status });
                    } else {
                        reject({ resp, status: response.status, });
                    }
                }, (error) => reject({ error, status: response.status, }));
            }
            if (response.status < 300) {
                return resolve(response);
            }
            return reject(response);
        }, (error) => reject(error)));
};

/**
 *
 * @param {string} url
 * @param {object} data
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
 * @param {object} [data] - {}
 * @param {boolean} [omitContentType] - false
 * @param {boolean} [jsonp] - false
 * @returns {Promise}
 */
const api = (request, data, omitContentType = false, jsonp = false) => {
    let url = request.url;
    const crossDomain = url.indexOf('http') === 0;
    const method = typeof request.method === 'undefined' ? 'GET' : request.method;

    if (url.indexOf('/') !== 0 && !crossDomain) {
        url = '/' + url;
    }
    url = API_PREFIX + API_VERSION + url;

    if (jsonp) {
        return jsonpFetch(url, data);
    }
    return normalFetch(url, method, data, crossDomain, request.headers, omitContentType);
};

export default api;
