import api from '../utils/api';
import token from '../utils/token';
import { BACKEND_URLS } from '../constants';

export const EXPENSE_FETCHING = 'EXPENSE_FETCHING';
export const EXPENSE_FETCHED = 'EXPENSE_FETCHED';
export const EXPENSES_FETCHED = 'EXPENSES_FETCHED';
export const EXPENSE_CREATING = 'EXPENSE_CREATING';
export const EXPENSE_CREATED = 'EXPENSE_CREATED';
export const EXPENSE_TOKEN_ADDED = 'EXPENSE_TOKEN_ADDED';
export const EXPENSE_RECEIPT_UPLOADED = 'EXPENSE_RECEIPT_UPLOADED';
export const EXPENSE_RECEIPT_ROTATED = 'EXPENSE_RECEIPT_ROTATED';
export const EXPENSE_RECEIPT_DELETED = 'EXPENSE_RECEIPT_DELETED';
export const CLEAR_EXPENSES = 'CLEAR_EXPENSES';
export const EXPENSE_EXPIRE_TOKEN = 'EXPENSE_EXPIRE_TOKEN';

export const getExpenses = (page, orderBy = 'expense_date', dir = 'desc', resolve, reject) =>
    (dispatch) => {
        dispatch({ type: EXPENSE_FETCHING });
        token.through().then(header => {
            api({
                url: `/expenses?page=${ page }&orderBy=${ orderBy }&orderDir=${ dir }`,
                method: 'GET',
                headers: header,
            }).then(resp => {
                dispatch({ type: EXPENSES_FETCHED, payload: resp.data });
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

export const clearExpenses = () =>
    (dispatch) => dispatch({ type: CLEAR_EXPENSES });

export const expireToken = (user_token, resolve, reject) =>
    (dispatch) => token.through().then(header => {
        api({
            url: '/expenses/',
            method: 'PUT',
            headers: header,
        }, { token: user_token, expire: true }).then(resp => {
            dispatch({ type: EXPENSE_EXPIRE_TOKEN });
            resolve && resolve(resp.data);
        }, reject);
    }, reject);

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

export const uploadReceipt = (user_token, expense_id, file, name, resolve, reject) =>
    (dispatch) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('name', name);
        api({
            url: `${ BACKEND_URLS.EXPENSE_SCANS }/${ user_token }/${ expense_id }`,
            method: 'POST',
        }, formData, true).then(() => {
            dispatch({ type: EXPENSE_RECEIPT_UPLOADED });
            resolve && resolve();
        }, reject);
    };

export const rotateReceipt = (user_token, expense_id, object_name, resolve, reject) =>
    (dispatch) =>
        api({
            url: `${ BACKEND_URLS.EXPENSE_SCANS }/${ user_token }/${ expense_id }`,
            method: 'PUT'
        }, { object_name, action: 'rotate' }).then(() => {
            dispatch({ type: EXPENSE_RECEIPT_ROTATED });
            resolve && resolve();
        }, reject);

export const deleteReceipt = (user_token, expense_id, object_name, resolve, reject) =>
    (dispatch) =>
        api({
            url: `${ BACKEND_URLS.EXPENSE_SCANS }/${ user_token }/${ expense_id }`,
            method: 'DELETE'
        }, { object_name }).then(() => {
            dispatch({ type: EXPENSE_RECEIPT_DELETED });
            resolve && resolve();
        }, reject);
