import api from '../utils/api'
import {clearLandingPage, notifications} from "./appActions";


export const USER_LOGGING_IN = 'USER_LOGGING_IN';
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';
export const USER_LOGIN_FAIL = 'USER_LOGIN_FAIL';
export const USER_FETCHING = 'USER_FETCHING';
export const USER_FETCHED = 'USER_FETCHED';
export const USER_MUST_LOGIN = 'USER_MUST_LOGIN';
export const USER_LOGIN_ERROR = 'USER_LOGIN_ERROR';
export const USER_LOGGING_OUT = 'USER_LOGGING_OUT';
export const USER_LOGGED_OUT = 'USER_LOGGED_OUT';
export const USERS_FETCHING = 'USERS_FETCHING';
export const USERS_FETCHED = 'USERS_FETCHED';
export const USERS_FETCH_FAEILED = 'USERS_FETCH_FAEILED';


export function login(email, password) {
    return function (dispatch) {
        dispatch({type: USER_LOGGING_IN});
        const request = {
            url: '/login',
            method: "POST",
            headers: {'Authorization': 'Basic ' + btoa(email + ":" + password)}
        };

        api(request).then(resp => {
            if (resp.status < 300) {
                dispatch({
                    type: USER_LOGIN_SUCCESS,
                    payload: resp.data
                });
            } else {
                dispatch({
                    type: USER_LOGIN_FAIL,
                    payload: {
                        message: resp.message,
                        email: email,
                        password: password
                    }
                });
                dispatch(notifications([
                    {type: 'danger', message: "Nombre de usuario o contraseña no son válidos"}
                ]));
            }
        }, err => {
            dispatch({
                type: USER_LOGIN_ERROR,
                payload: {
                    error: err,
                    email: email,
                    password: password
                }
            });
            dispatch(notifications([
                {type: 'danger', message: "Ha ocurrido un error inesperado."}
            ]));
        });
    }
}

export function fetchUser() {
    return function (dispatch) {
        dispatch({type: USER_FETCHING});
        api({url: '/user'}).then(resp => {
            if (resp.status < 300) {
                dispatch({
                    type: USER_FETCHED,
                    payload: resp.data
                });
            } else {
                dispatch({
                    type: USER_MUST_LOGIN,
                    payload: resp.message
                })
            }
        }, err => {
            dispatch({
                type: USER_LOGIN_ERROR,
                payload: {
                    error: err,
                }
            });
            dispatch(notifications([
                {type: 'danger', message: "Ha ocurrido un error inesperado."}
            ]));
        });
    }
}

export function logout() {
    return function(dispatch) {
        dispatch({
            type: USER_LOGGING_OUT,
        });

        api({url: '/login', method: 'DELETE'}).then(() => {
            dispatch({
                type: USER_LOGGED_OUT,
            });
        }, err => {

        })
    }
}

export function getUsers() {
    return function(dispatch) {
        dispatch({
            type: USERS_FETCHING
        })
    }

}