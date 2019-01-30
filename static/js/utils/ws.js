/**
 * Created by jgarcia on 10/7/16.
 */

import io from 'socket.io-client';

/**
 *
 * @param {string} message
 * @param {string} namespace
 * @param {Function} callback
 */
const ws = (message, namespace = '/', callback) => {
    if (namespace[0] !== '/') {
        throw Error('Always start namespaces with forward slash `/`');
    }

    const socket = io(namespace, {
        path: '/ws'
    });

    socket.on(message, data => {
        callback(data);
    });
};

export default ws;
