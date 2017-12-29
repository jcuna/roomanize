
import api from "../utils/api";
import {token} from "../utils/token";

export const ROLES_FETCHING = 'ROLES_FETCHING';
export const ROLES_RECEIVED = 'ROLES_RECEIVED';
export const ROLES_FAILED = 'ROLES_FAILED';
export const CREATE_ROLE_SUCCESS = "CREATE_ROLE_SUCCESS";
export const CREATE_ROLE_DISPATCHED = "CREATE_ROLE_DISPATCHED";
export const CREATE_ROLE_FAILED = "CREATE_ROLE_FAILED";

export function createRole(name) {
    return function (dispatch) {
        dispatch({type: CREATE_ROLE_DISPATCHED});

        token.through().then(header => {
            api({
                url: '/roles',
                method: 'POST',
                headers: header
            }, name).then(data => {
                dispatch({
                    type: CREATE_ROLE_SUCCESS,
                    payload: data.data
                });
            }, err => {
                dispatch({
                    type: CREATE_ROLE_FAILED,
                    payload: err
                });
            });
        });
    }
}

export function fetchRoles() {
    return function (dispatch) {
        dispatch({type: ROLES_FETCHING});
        token.through().then(header => api({
            url: '/roles',
            method: 'GET',
            headers: header
        }).then(data => {
            dispatch({
                type: ROLES_RECEIVED,
                payload: data.data
            });
        }, err => {
            dispatch({type: ROLES_FAILED, payload: err})
        }), err => dispatch({type: ROLES_FAILED, payload: err}));
    }
}