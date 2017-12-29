import {USER_MUST_LOGIN, USER_RECEIVED} from "../actions/userActions";
import api from "./api";

class Token {

    set data(props) {
        this._data = props;
    }

    get timestamp() {
        return Math.round((new Date()).getTime() / 1000);
    }

    through() {
        return new Promise((resolve, reject) => {
            this.expired(this.timestamp).then(didExpire => {
                if (didExpire) {
                    api({url: '/user'}).then(data => {
                        if (data.status < 300) {
                            this._data.dispatch({
                                type: USER_RECEIVED,
                                payload: data.data
                            });
                            resolve(this.authHeaders());
                        } else {
                            reject(Error('No active session'));
                            this._data.dispatch({
                                type: USER_MUST_LOGIN,
                                payload: data.message
                            });
                        }
                    }, err => {
                        reject(err);
                    });
                } else if (this._data.token.value !== undefined) {
                    resolve(this.authHeaders())
                } else {
                    reject(Error('No active session'));
                }
            });
        });
    }

    expired(timestamp) {
        return new Promise(resolve => {
            if (this._data === undefined) {
                setTimeout(() => {
                    return this.expired(timestamp);
                }, 1);
            } else {
                resolve(timestamp + 10 > this._data.token.expires);
            }
        });
    }

    authHeaders() {
        return {
            "x-access-token": this._data.token.value
        }
    }
}

export const token = new Token();