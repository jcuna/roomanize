import api from '../utils/api'
import {clearLandingPage, notifications} from "./appActions";


export const USER_LOGGING_IN = "USER_LOGGING_IN";
export const USER_LOGIN_SUCCESSFUL = "USER_LOGIN_SUCCESSFUL";
export const USER_LOGIN_FAIL = "USER_LOGIN_FAIL";
export const USER_FETCHING = "USER_FETCHING";
export const USER_RECEIVED = "USER_RECEIVED";
export const USER_MUST_LOGIN = "USER_MUST_LOGIN";
export const USER_LOGIN_ERROR = "USER_LOGIN_ERROR";
export const USER_LOGGING_OUT = "USER_LOGGING_OUT";
export const USER_LOGGED_OUT = "USER_LOGGED_OUT";


export function login(email, password) {
    return function (dispatch) {
        dispatch({type: 'USER_LOGGING_IN'});
        const request = {
            url: '/login',
            method: "POST",
            headers: {'Authorization': 'Basic ' + btoa(email + ":" + password)}
        };

        api(request).then(data => {
            if (data.status < 300) {
                dispatch({
                    type: USER_LOGIN_SUCCESSFUL,
                    payload: data.data
                });
                dispatch(clearLandingPage());
            } else {
                dispatch({
                    type: USER_LOGIN_FAIL,
                    payload: {
                        message: data.message,
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

export function getUser() {
    return function (dispatch) {
        dispatch({
            type: USER_FETCHING,
        });
        api({url: '/user'}).then(data => {
            if (data.status < 300) {
                dispatch({
                    type: USER_RECEIVED,
                    payload: data.data
                });
            } else {
                dispatch({
                    type: USER_MUST_LOGIN,
                    payload: data.message
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