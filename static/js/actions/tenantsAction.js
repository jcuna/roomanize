import api from '../utils/api';
import { token } from '../utils/token';

export const TENANT_CREATED = 'TENANT_CREATED';
export const TENANTS_PROCESSING = 'TENANTS_PROCESSING';
export const TENANTS_PROCESSING_FAILED = 'TENANTS_PROCESSING_FAILED';
export const TENANTS_FETCHED = 'TENANTS_FETCHED';
export const TENANT_SELECTED_CLEAR = 'TENANT_SELECTED_CLEAR';
export const TENANT_SELECTED_SET = 'TENANT_SELECTED_SET';

export const createTenant = (data, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: TENANTS_PROCESSING });
        token.through().then(header => api({
            url: 'tenants',
            method: 'POST',
            headers: header,
        }, data).then(resp => {
            dispatch({ type: TENANT_CREATED, payload: resp.data });
            resolve && resolve(data.id);
        }, reject), reject);
    };

export const editTenant = (data, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: TENANTS_PROCESSING });
        token.through().then(header => api({
            url: `tenants/${ data.id }`,
            method: 'PUT',
            headers: header,
        }, data).then( () => {
            resolve && resolve();
        }, reject), reject);
    };

export const getTenants = (page, orderBy, dir, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: TENANTS_PROCESSING });
        token.through().then(header => api({
            url: `tenants?page=${ page }&orderBy=${ orderBy }&orderDir=${ dir }`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            dispatch({ type: TENANTS_FETCHED, payload: resp.data });
            resolve && resolve();
        }, reject), reject);
    };

export const getTenant = (tenant_id, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: TENANTS_PROCESSING });
        token.through().then(header => api({
            url: `tenants/${ tenant_id }`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            dispatch({ type: TENANT_SELECTED_SET, payload: resp.data });
            resolve && resolve();
        }, reject), reject);
    };

export const setSelectedTenant = (selected) =>
    (dispatch) => {
        const payload = { ...selected };
        dispatch({ type: TENANT_SELECTED_SET, payload });
    };

export const clearSelectedTenant = () =>
    (dispatch) => dispatch({ type: TENANT_SELECTED_CLEAR });

export const searchTenants = (query, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: TENANTS_PROCESSING });
        token.through().then(header => api({
            url: `tenants?query=${ query }`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            dispatch({ type: TENANTS_FETCHED, payload: resp.data });
            resolve && resolve();
        }, reject), reject);
    };
