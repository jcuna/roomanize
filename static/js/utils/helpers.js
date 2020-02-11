export const searchArray = (array, value, keys) => {
    const result = [];

    array.forEach(item => keys.forEach(key => {
        if (item[key].toLowerCase().indexOf(value.toLowerCase()) > -1) {
            result.push(item);
        }
    }));
    return result;
};

let timeout = 0;

export const afterPause = resolve => {
    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        resolve();
        timeout = 0;
    }, 1000);
};

export const formatPhone = phone => {
    const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phone.replace(re, '($1) $2-$3');
};

export const capitalizeAll = str => {
    return str.replace(/\w\S*/g, txt => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

export const friendlyDateEs = (date) => {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return capitalizeAll(date.toLocaleDateString('es-US', options));
};

/**
 * convert to match users timezone
 * @param {Date} date
 */
export const toLocalTimezone = (date) => {
    date.setHours(date.getHours() - (date.getTimezoneOffset() / 60));
};

export const toDatePicker = (date) => {
    const month = String(date.getMonth() + 1);
    return date.getFullYear() + '-' + ('0' + month.slice(-2)) + '-' + (('0' + date.getDate()).slice(-2));
};

export const formatAMPM = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours %= 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
};

/**
 * This formats dates only. time is depreciated.
 * @param {Date} date
 * @param {boolean} showTime
 * @returns {string}
 */
export const formatDateEs = (date, showTime = false) => {
    toLocalTimezone(date);
    const to_date_format = new Date(date.toDateString());
    const today = new Date(new Date().toDateString());
    const delta = Math.round(Number(today - to_date_format) / 1000);
    const day = 60 * 60 * 24; // in seconds

    switch (delta) {
        case 0:
            return showTime ? formatAMPM(date) : 'Hoy';
        case -day:
            return 'Mañana';
        case -(day * 2):
            return 'Pasado Mañana';
        case day:
            return 'Ayer';
        case day * 2:
            return 'Antes De Ayer';
        default:
            return friendlyDateEs(to_date_format);
    }
};

export const dateToDatetimeString = (localDate) => {
    const today = new Date();
    const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    return localDate + ' ' + time;
};

export const generateNonce = () =>
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 *
 * @param {object} target - type Event object
 */
export const formatDecimal = ({ target }) => {
    let position = target.selectionStart;

    if (target.value.replace(/[0-9]/g, '').length === 2) {
        target.value = target.value.replace('.', '');
    }

    if (!isNaN(target.value)) {
        if (target.value.indexOf('.') < 0) {
            target.value += '.00';
        }
    }
    if (target.value.split('.').pop().length > 2) {
        target.value = target.value.substring(0, target.value.length - 1);
    }
    if (position > target.value.indexOf('.') + 4) {
        target.value = target.value.substring(0, target.value.length - 1);
        position -= 2;
    }
    target.selectionEnd = position;
};
/**
 * usage
 * worker = inlineWorker(function() {..., etc)
 * worker.onmessage = function(e) {
 *     alert(done);
 * };
 * worker.postMessage('start');
 *
 * @param { Function } func
 * @return {Worker}
 */
export const inlineWorker = function (func) {
    if (typeof Worker === 'function') {
        return new Worker(URL.createObjectURL(
            new Blob([`onmessage = ${ func.toString() }`], { type: 'text/javascript' })
        ));
    }
    return null;
};

export const b64EncodeUnicode = (str) => {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
    }));
};

// Decoding base64 ⇢ UTF8

export const b64DecodeUnicode = (str) => {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
};

export const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const download_blob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    setTimeout(() => {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(url);
    }, 100);
};
