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

export const formatDateEs = date => {
    // account for utc +4 hour
    // date.setHours(date.getHours() - 4);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return capitalizeAll(date.toLocaleDateString('es-US', options));
};
