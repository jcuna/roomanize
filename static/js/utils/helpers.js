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

export const afterPause = (resolve) => {
    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        resolve();
        timeout = 0;
    }, 1000);
};
