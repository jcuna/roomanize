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

/**
 * This formats dates only. time is depreciated.
 * @param {Date} date
 * @returns {string}
 */
export const formatDateEs = date => {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    date = new Date(date.toDateString());
    const today = new Date(new Date().toDateString());
    const delta = Math.round(Number(today - date) / 1000);
    const day = 60 * 60 * 24; // in seconds

    switch (delta) {
        case 0:
            return 'Hoy';
        case -day:
            return 'Mañana';
        case -(day * 2):
            return 'Pasado Mañana';
        case day:
            return 'Ayer';
        case day * 2:
            return 'Antes De Ayer';
        default:
            return capitalizeAll(date.toLocaleDateString('es-US', options));
    }
};
