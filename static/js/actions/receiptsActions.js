import api from '../utils/api';
import token from '../utils/token';

export const RECEIPTS_FETCHING = 'RECEIPTS_FETCHING';
export const RECEIPTS_FETCHED = 'RECEIPTS_FETCHED';

export const getReceipts = (page, orderBy, dir, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: RECEIPTS_FETCHING });
        token.through().then(header => {
            api({
                url: `/receipts?page=${ page }&orderBy=${ orderBy }&orderDir=${ dir }`,
                method: 'GET',
                headers: header,
            }).then(resp => {
                dispatch({ type: RECEIPTS_FETCHED, payload: resp.data });
                resolve && resolve();
            }, reject);
        }, reject);
    };

export const searchReceipts = (key, value, orderBy, dir, page, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: RECEIPTS_FETCHING });
        token.through().then(header => api({
            url: `/receipts?${ key }=${ value }&page=${page}&orderBy=${ orderBy }&orderDir=${ dir }`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            dispatch({ type: RECEIPTS_FETCHED, payload: resp.data });
            resolve && resolve();
        }, reject), reject);
    };
