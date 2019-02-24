export const searchArray = (array, value, key1, key2) => {
    const result = [];

    array.forEach(item => {
        if (item[key1].toLowerCase().indexOf(value.toLowerCase()) > -1) {
            result.push(item);
        } else if (key2 && item[key2].toLowerCase().indexOf(value.toLowerCase()) > -1) {
            result.push(item);
        }
    });
    return result;
};
