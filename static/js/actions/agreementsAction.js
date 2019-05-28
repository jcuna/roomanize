import api from '../utils/api';
import token from '../utils/token';

export const AGREEMENTS_PROCESSING = 'AGREEMENTS_PROCESSING';
export const AGREEMENTS_FETCHED = 'AGREEMENTSFETCHED ';
export const AGREEMENT_CLEAR = 'AGREEMENT_CLEAR';
export const AGREEMENT_CREATED = 'AGREEMENT_CREATED';
export const AGREEMENT_SET = 'AGREEMENT_SET';

export const createAgreement = (data, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: AGREEMENTS_PROCESSING });
        token.through().then(header => api({
            url: '/agreements',
            method: 'POST',
            headers: header,
        }, data).then(resp => {
            resolve && resolve();
            dispatch({ type: AGREEMENT_CREATED, payload: resp.data });
        }, reject), reject);
    };

export const setAgreement = (agreement) =>
    (dispatch) => {
        dispatch({ type: AGREEMENT_SET, payload: agreement });
    };

export const getAgreement = (agreement_id, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: AGREEMENTS_PROCESSING });
        token.through().then(header => {
            api({
                url: `/agreements/${ agreement_id }`,
                method: 'GET',
                headers: header,
            }).then(resp => {
                setAgreement(resp.data);
                resolve && resolve();
            }, reject);
        }, reject);
    };

export const getAgreements = (page, orderBy, dir, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: AGREEMENTS_PROCESSING });
        token.through().then(header => {
            api({
                url: `/agreements?page=${ page }&orderBy=${ orderBy }&orderDir=${ dir }`,
                method: 'GET',
                headers: header,
            }).then(resp => {
                dispatch({ type: AGREEMENTS_FETCHED, payload: resp.data });
                resolve && resolve();
            }, reject);
        }, reject);
    };

export const clearAgreement = () =>
    (dispatch) => dispatch({ type: AGREEMENT_CLEAR });
