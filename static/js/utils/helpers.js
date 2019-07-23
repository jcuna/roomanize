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

/**
 * This formats dates only. time is depreciated.
 * @param {Date} date
 * @returns {string}
 */
export const formatDateEs = date => {
    toLocalTimezone(date);
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
            return friendlyDateEs(date);
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

export class ImageCompression {
    constructor(elem, img) {
        this.elem = elem;
        this.img = img;

        this.process1 = this.process1.bind(this);
        this.process2 = this.process2.bind(this);
    }

    // returns a function that calculates lanczos weight
    lanczosCreate(lobes) {
        return function (x) {
            if (x > lobes) {
                return 0;
            }
            x *= Math.PI;
            if (Math.abs(x) < 1e-16) {
                return 1;
            }
            const xx = x / lobes;
            return Math.sin(x) * Math.sin(xx) / x / xx;
        };
    }

    // elem: canvas element, img: image element, sx: scaled width, lobes: kernel radius
    lanczosCompress(width, lobes, resolve) {
        this.resolve = resolve;
        this.elem.width = this.img.width;
        this.elem.height = this.img.height;
        this.elem.style.display = 'none';
        this.ctx = this.elem.getContext('2d');
        this.ctx.drawImage(this.img, 0, 0);
        this.src = this.ctx.getImageData(0, 0, this.img.width, this.img.height);
        this.dest = {
            width,
            height: Math.round(this.img.height * width / this.img.width),
        };
        this.dest.data = new Array(this.dest.width * this.dest.height * 3);
        this.lanczos = this.lanczosCreate(lobes);
        this.ratio = this.img.width / width;
        this.rcp_ratio = 2 / this.ratio;
        this.range2 = Math.ceil(this.ratio * lobes / 2);
        this.cacheLanc = {};
        this.center = {};
        this.icenter = {};
        setTimeout(this.process1, 0, 0);
    }

    hermiteCompress(width, resolve) {
        width = Math.round(width);
        const height = Math.round(this.img.height * width / this.img.width);

        const ratio_w = this.img.width / width;
        const ratio_h = this.img.height / height;
        const ratio_w_half = Math.ceil(ratio_w / 2);
        const ratio_h_half = Math.ceil(ratio_h / 2);

        const ctx = this.elem.getContext('2d');
        ctx.drawImage(this.img, 0, 0);
        const img = ctx.getImageData(0, 0, this.img.width, this.img.height);
        const img2 = ctx.createImageData(width, height);
        const data = img.data;
        const data2 = img2.data;

        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                const x2 = (i + j * width) * 4;
                let weight = 0;
                let weights = 0;
                let weights_alpha = 0;
                let gx_r = 0;
                let gx_g = 0;
                let gx_b = 0;
                let gx_a = 0;
                const center_y = (j + 0.5) * ratio_h;
                const yy_start = Math.floor(j * ratio_h);
                const yy_stop = Math.ceil((j + 1) * ratio_h);
                for (let yy = yy_start; yy < yy_stop; yy++) {
                    const dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                    const center_x = (i + 0.5) * ratio_w;
                    const w0 = dy * dy; //pre-calc part of w
                    const xx_start = Math.floor(i * ratio_w);
                    const xx_stop = Math.ceil((i + 1) * ratio_w);
                    for (let xx = xx_start; xx < xx_stop; xx++) {
                        const dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                        const w = Math.sqrt(w0 + dx * dx);
                        if (w >= 1) {
                            //pixel too far
                            continue;
                        }
                        //hermite filter
                        weight = 2 * w * w * w - 3 * w * w + 1;
                        const pos_x = 4 * (xx + yy * this.img.width);
                        //alpha
                        gx_a += weight * data[pos_x + 3];
                        weights_alpha += weight;
                        //colors
                        if (data[pos_x + 3] < 255) {
                            weight = weight * data[pos_x + 3] / 250;
                        }
                        gx_r += weight * data[pos_x];
                        gx_g += weight * data[pos_x + 1];
                        gx_b += weight * data[pos_x + 2];
                        weights += weight;
                    }
                }
                data2[x2] = gx_r / weights;
                data2[x2 + 1] = gx_g / weights;
                data2[x2 + 2] = gx_b / weights;
                data2[x2 + 3] = gx_a / weights_alpha;
            }
        }
        // ctx.clearRect(0, 0, this.img.width, this.img.height);
        // this.elem.width = width;
        // this.elem.height = height;
        //draw
        ctx.putImageData(img, 0, 0);
        this.elem.style.display = 'block';
        resolve();
    }

    process1(u) {
        this.center.x = (u + 0.5) * this.ratio;
        this.icenter.x = Math.floor(this.center.x);
        for (let v = 0; v < this.dest.height; v++) {
            this.center.y = (v + 0.5) * this.ratio;
            this.icenter.y = Math.floor(this.center.y);
            let a, b, g, r;
            a = r = g = b = 0;
            for (let i = this.icenter.x - this.range2; i <= this.icenter.x + this.range2; i++) {
                if (i < 0 || i >= this.src.width) {
                    continue;
                }
                const f_x = Math.floor(1000 * Math.abs(i - this.center.x));
                if (!this.cacheLanc[f_x]) {
                    this.cacheLanc[f_x] = {};
                }
                for (let j = this.icenter.y - this.range2; j <= this.icenter.y + this.range2; j++) {
                    if (j < 0 || j >= this.src.height) {
                        continue;
                    }
                    const f_y = Math.floor(1000 * Math.abs(j - this.center.y));
                    if (typeof this.cacheLanc[f_x][f_y] == 'undefined') {
                        this.cacheLanc[f_x][f_y] = this.lanczos(Math.sqrt(Math.pow(f_x * this.rcp_ratio, 2) +
                            Math.pow(f_y * this.rcp_ratio, 2)) / 1000);
                    }
                    const weight = this.cacheLanc[f_x][f_y];
                    if (weight > 0) {
                        const idx = (j * this.src.width + i) * 4;
                        a += weight;
                        r += weight * this.src.data[idx];
                        g += weight * this.src.data[idx + 1];
                        b += weight * this.src.data[idx + 2];
                    }
                }
            }
            const idx = (v * this.dest.width + u) * 3;
            this.dest.data[idx] = r / a;
            this.dest.data[idx + 1] = g / a;
            this.dest.data[idx + 2] = b / a;
        }

        if (++u < this.dest.width) {
            setTimeout(this.process1, 0, u);
        } else {
            setTimeout(this.process2, 0);
        }
    }

    process2() {
        this.canvas.width = this.dest.width;
        this.canvas.height = this.dest.height;
        this.ctx.drawImage(this.img, 0, 0, this.dest.width, this.dest.height);
        this.src = this.ctx.getImageData(0, 0, this.dest.width, this.dest.height);
        let idx, idx2;
        for (let i = 0; i < this.dest.width; i++) {
            for (let j = 0; j < this.dest.height; j++) {
                idx = (j * this.dest.width + i) * 3;
                idx2 = (j * this.dest.width + i) * 4;
                this.src.data[idx2] = this.dest.data[idx];
                this.src.data[idx2 + 1] = this.dest.data[idx + 1];
                this.src.data[idx2 + 2] = this.dest.data[idx + 2];
            }
        }
        this.ctx.putImageData(this.src, 0, 0);
        this.elem.style.display = 'block';
        this.resolve();
    }
}
