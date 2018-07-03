import api from '../utils/api';
import { token } from '../utils/token';
import { clearNotifications, hideOverlay, notifications } from './appActions';

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
export const USERS_FETCH_FAIL = 'USERS_FETCH_FAIL';
export const USER_CREATING = 'USER_CREATING';
export const USER_CREATED = 'USER_CREATED';
export const USER_CREATE_FAIL = 'USER_CREATE_FAIL';

export const login = (email, password) => {
    return (dispatch) => {
        dispatch({ type: USER_LOGGING_IN });
        const request = {
            url: '/login',
            method: 'POST',
            headers: { Authorization: 'Basic ' + btoa(email + ':' + password) }
        };

        api(request).then(resp => {
            if (resp.status < 300) {
                dispatch({
                    type: USER_LOGIN_SUCCESS,
                    payload: resp.data
                });
                dispatch(clearNotifications())
            } else {
                dispatch({
                    type: USER_LOGIN_FAIL,
                    payload: {
                        message: resp.message,
                        email,
                        password
                    }
                });
                dispatch(notifications([
                    { type: 'danger', message: 'Nombre de usuario o contraseña no son válidos' }
                ]));
            }
        }, err => {
            dispatch({
                type: USER_LOGIN_ERROR,
                payload: {
                    error: err,
                    email,
                    password,
                }
            });
            dispatch(notifications([
                { type: 'danger', message: 'Ha ocurrido un error inesperado.' }
            ]));
        });
    };
};

export const fetchUser = () => {
    return (dispatch) => {
        dispatch({ type: USER_FETCHING });
        api({ url: '/user' }).then(resp => {
            if (resp.status < 300) {
                dispatch({
                    type: USER_FETCHED,
                    payload: resp.data
                });
            } else {
                dispatch({
                    type: USER_MUST_LOGIN,
                    payload: resp.message
                });
            }
        }, err => {
            dispatch({
                type: USER_LOGIN_ERROR,
                payload: {
                    error: err,
                }
            });
            dispatch(notifications([
                { type: 'danger', message: 'Ha ocurrido un error inesperado.' }
            ]));
        });
    };
};

/**
 *
 * @returns {Function}
 */
export const logout = () => {
    return (dispatch) => {
        dispatch({ type: USER_LOGGING_OUT });

        api({ url: '/login', method: 'DELETE' }).then(() => {
            dispatch({
                type: USER_LOGGED_OUT,
            });
        }, err => {

        });
    };
};

export const fetchUsers = (orderBy = 'id', orderDir = 'asc', page = 1, limit = 50) => {
    return (dispatch) => {
        dispatch({ type: USERS_FETCHING });

        token.through().then(header => {
            api({
                url: `/users?limit=${limit}&page=${page}&orderBy=${orderBy}&orderDir=${orderDir}`,
                method: 'GET',
                headers: header
            }).then((resp) => {
                dispatch({
                    type: USERS_FETCHED,
                    payload: resp.data
                });
            }, err => {
                dispatch({
                    type: USERS_FETCH_FAIL,
                });
            });
        }, err => {
            dispatch({
                type: USERS_FETCH_FAIL,
            });
        });
    };
};

export const createUser = (user) => {
    user = { ...user, roles: user.roles.map(role => role.id) };

    return (dispatch) => {
        dispatch({ type: USER_CREATING });
        token.through().then(header => {
            api({
                url: '/users',
                method: 'POST',
                headers: header,
            }, user).then(resp => {
                dispatch({
                    type: USER_CREATED,
                    payload: resp.data
                });
                dispatch(hideOverlay());
                dispatch(notifications([
                    { type: 'success', message: 'Usuario creado satisfactoriamente' }
                ]));
            }, err => {
                dispatch(hideOverlay());
                dispatch({ type: USER_CREATE_FAIL });
                dispatch(notifications([
                    { type: 'danger', message: 'Hubo un error creando el usuario' }
                ]));
            });
        });
    };
};
