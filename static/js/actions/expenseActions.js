import api from '../utils/api';
import token from '../utils/token';
import { BACKEND_URLS } from '../constants';

export const EXPENSE_FETCHING = 'EXPENSE_FETCHING';
export const EXPENSE_FETCHED = 'EXPENSE_FETCHED';
export const EXPENSE_CREATING = 'EXPENSE_CREATING';
export const EXPENSE_CREATED = 'EXPENSE_CREATED';
export const EXPENSE_TOKEN_ADDED = 'EXPENSE_TOKEN_ADDED';
export const EXPENSE_TOKEN_CLEAR = 'EXPENSE_TOKEN_CLEAR';
export const EXPENSE_RECEIPT_UPLOADED = 'EXPENSE_RECEIPT_UPLOADED';

export const getExpenses = (page, orderBy = 'expense_date', dir = 'desc', resolve, reject) =>
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

export const getExpense = (expense_id, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: EXPENSE_FETCHING });
        token.through().then(header => {
            api({
                url: `/expenses/${expense_id}`,
                method: 'GET',
                headers: header,
            }).then(resp => {
                console.log(resp.data)
                dispatch({ type: EXPENSE_FETCHED, payload: resp.data });
                resolve && resolve();
            }, reject);
        }, reject);
    };

export const createNewExpense = (payload, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: EXPENSE_CREATING });
        token.through().then(header => {
            api({
                url: '/expenses/',
                method: 'POST',
                headers: header,
            }, payload).then(resp => {
                dispatch({ type: EXPENSE_CREATED, payload: resp.data });
                resolve && resolve(resp.data);
            }, reject);
        }, reject);
    };

export const editExpense = (expense_id, body, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: EXPENSE_CREATING });
        token.through().then(header => {
            api({
                url: `/expenses/${expense_id}`,
                method: 'POST',
                headers: header,
            }, body).then(resp => {
                dispatch({ type: EXPENSE_CREATED, payload: resp.data });
                resolve && resolve(resp.data);
            }, reject);
        }, reject);
    };

export const clearScanUrl = () =>
    (dispatch) => dispatch({ type: EXPENSE_TOKEN_CLEAR });

export const validateExpenseToken = (user_token, expense_id, resolve, reject) =>
    (dispatch) => {
        api({
            url: `${BACKEND_URLS.EXPENSE_SCANS}/${user_token}/${expense_id}`,
            method: 'GET',
        }).then(resp => {
            dispatch({ type: EXPENSE_CREATED, payload: resp.data });
            resolve && resolve(resp.data);
        }, reject);
    };

export const uploadReceipt = (user_token, expense_id, file, resolve, reject) =>
    (dispatch) => {
        const formData = new FormData();
        formData.append(file.name, file);
        api({
            url: `${ BACKEND_URLS.EXPENSE_SCANS }/${ user_token }/${ expense_id }`,
            method: 'POST',
        }, formData, true).then(() => {
            dispatch({ type: EXPENSE_RECEIPT_UPLOADED });
            resolve && resolve();
        }, reject);
    };
