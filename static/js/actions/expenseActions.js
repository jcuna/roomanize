import api from '../utils/api';
import token from '../utils/token';

export const EXPENSE_FETCHING = 'EXPENSE_FETCHING';
export const EXPENSE_FETCHED = 'EXPENSE_FETCHED';
export const EXPENSE_TOKEN_FETCHING = 'EXPENSE_TOKEN_FETCHING';
export const EXPENSE_TOKEN_FETCHED = 'EXPENSE_TOKEN_FETCHED';
export const EXPENSE_TOKEN_ADDED = 'EXPENSE_TOKEN_ADDED';
export const EXPENSE_TOKEN_CLEAR = 'EXPENSE_TOKEN_CLEAR';

export const getExpenses = (page, orderBy, dir, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: EXPENSE_FETCHING });
        token.through().then(header => {
            api({
                url: `/expenses?page=${ page }&orderBy=${ orderBy }&orderDir=${ dir }`,
                method: 'GET',
                headers: header,
            }).then(resp => {
                dispatch({ type: EXPENSE_FETCHED, payload: resp.data });
                resolve && resolve();
            }, reject);
        }, reject);
    };

export const getExpenseToken = (nonce, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: EXPENSE_TOKEN_FETCHING });
        token.through().then(header => {
            api({
                url: `/expenses/?get_scan_token=${nonce}`,
                method: 'POST',
                headers: header,
            }).then(resp => {
                dispatch({ type: EXPENSE_TOKEN_FETCHED, payload: resp.data });
                resolve && resolve(resp.data.token);
            }, reject);
        }, reject);
    };

export const clearScanUrl = () =>
    (dispatch) => dispatch({ type: EXPENSE_TOKEN_CLEAR });

export const getUploadedPics = (pic_token, resolve, reject) =>
    (dispatch) => {
        token.through().then(header => {
            api({
                url: `/expenses-token/${pic_token}`,
                method: 'GET',
                headers: header,
            }).then(resp => {
                dispatch({ type: EXPENSE_TOKEN_FETCHED, payload: resp.data });
                resolve && resolve();
            }, reject);
        }, reject);
    };
