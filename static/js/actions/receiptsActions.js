import api from '../utils/api';
import token from '../utils/token';

export const RECEIPTS_FETCHING = 'RECEIPTS_FETCHING';
export const RECEIPTS_FETCHED = 'RECEIPTS_FETCHED';
export const BALANCE_FETCHED = 'BALANCE_FETCHED';
export const BALANCE_FETCHING = 'BALANCE_FETCHING';

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

export const getAgreementBalance = (agreement_id, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: BALANCE_FETCHING });
        token.through().then(header => {
            api({
                url: `/pay-balance/${ agreement_id }`,
                method: 'GET',
                headers: header,
            }).then(resp => {
                dispatch({ type: BALANCE_FETCHED, payload: resp.data });
                resolve && resolve();
            }, reject);
        }, reject);
    };
