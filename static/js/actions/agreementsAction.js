import api from '../utils/api';
import token from '../utils/token';

export const AGREEMENTS_PROCESSING = 'AGREEMENTS_PROCESSING';
export const AGREEMENTS_FETCHED = 'AGREEMENTSFETCHED ';
export const AGREEMENT_CLEAR = 'AGREEMENT_CLEAR';
export const AGREEMENT_CREATED = 'AGREEMENT_CREATED';
export const AGREEMENT_SET = 'AGREEMENT_SET';
export const AGREEMENT_PAYMENT_SUCCESS = 'AGREEMENT_PAYMENT_SUCCESS';
export const AGREEMENT_PAYMENT_FAIL = 'AGREEMENT_PAYMENT_FAIL';

export const createAgreement = (data, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: AGREEMENTS_PROCESSING });
        token.through().then(header => api({
            url: '/agreements',
            method: 'POST',
            headers: header,
        }, data).then(resp => {
            resolve && resolve(resp.data.id);
            dispatch({ type: AGREEMENT_CREATED, payload: resp.data });
        }, reject), reject);
    };

export const setAgreement = (agreement) =>
    (dispatch) => {
        dispatch({ type: AGREEMENT_SET, payload: agreement });
    };

export const updateAgreement = (data, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: AGREEMENTS_PROCESSING });
        token.through().then(header => {
            api({
                url: `/agreements/${ data.id }`,
                method: 'PUT',
                headers: header,
            }, data).then(resp => {
                resolve && resolve(resp.data);
            }, reject);
        }, reject);
    };

export const clearAgreement = () =>
    (dispatch) => dispatch({ type: AGREEMENT_CLEAR });

export const makePayment = (data, resolve, reject) =>
    (dispatch) =>
        token.through().then(header => {
            api({
                url: '/pay-balance',
                method: 'POST',
                headers: header
            }, data).then(resp => {
                resolve && resolve(resp.data);
                dispatch({ type: AGREEMENT_PAYMENT_SUCCESS });
            }, reject);
        }, reject);
