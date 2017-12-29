/**
 * Created by jgarcia on 10/7/16.
 */

import 'whatwg-fetch';
// let fetchJsonp = require('fetch-jsonp');
// let urlEncode = require('query-string');
/**
 *
 * @param request {Object}
 * @param data
 * @param jsonp {Boolean}
 * @returns {Promise}
 */
const api = function(request, data, jsonp = false) {

    const URL_PREFIX = '/api/v1.0';

    let url = request.url;
    let crossDomain = url.indexOf('http') === 0;
    let method = request.method === undefined ? 'GET' : request.method;

    if (url.indexOf('/') !== 0 && !crossDomain) {
        url = '/' + url;
    }
    url = URL_PREFIX + url;

    if (jsonp) {
        return jsonpFetch(url, data);
    } else {
        return normalFetch(url, method, data, crossDomain, request.headers);
    }
};

/**
 *
 * @param url {String}
 * @param method {String}
 * @param data
 * @param crossDomain {Boolean}
 * @param headers  {Object}
 * @returns {Promise}
 */
const normalFetch = function(url, method, data, crossDomain, headers = {}) {

    headers = {...headers, "Content-Type": "application/json"};

    const request = {
        headers: headers,
        credentials: "same-origin",
        method: method,
        body: JSON.stringify(data),
    };

    return new Promise(function(resolve, reject) {
        let status;
        return fetch(url, request).then(response => {
            const contentType = response.headers.get("content-type");
            status = response.status;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json().then(data => {
                    resolve({data: data, status: status})
                }, (error) => {
                    reject({error: error, status: status});
                });
            }
        }, (error) => {
            reject(error);
        });
    });
};

/**
 *
 * @param url {String}
 * @param data
 * @returns {Promise}
 */
const jsonpFetch = function (url, data) {
    let queryString = urlEncode.stringify(data);
    url = url+'?'+queryString;
    return fetchJsonp(url).then( response => {
        return response.json()
    });
};

export default api;
