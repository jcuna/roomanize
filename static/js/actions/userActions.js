import api from '../utils/api';
import { token } from '../utils/token';
import { clearNotifications, hideOverlay, notifications } from './appActions';
import ws from '../utils/ws';
import { ALERTS } from '../constants';

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
export const USER_DELETE_DISPATCHED = 'USER_DELETE_DISPATCHED';
export const USER_DELETE_SUCCESS = 'USER_DELETE_SUCCESS';
export const USER_DELETE_FAIL = 'USER_DELETE_FAIL';
export const USER_UPDATE_DISPATCHED = 'USER_UPDATE_DISPATCHED';
export const USER_UPDATE_SUCCESS = 'USER_UPDATE_SUCCESS';
export const USER_UPDATE_FAIL = 'USER_UPDATE_FAIL';
export const USER_TOKEN_FETCHED = 'USER_TOKEN_FETCHED';
export const USER_TOKEN_CLEAR = 'USER_TOKEN_CLEAR';
export const USER_WS_CHANGED = 'USER_WS_CHANGED';

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
                dispatch(clearNotifications());
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
                    { type: ALERTS.DANGER, message: 'Nombre de usuario o contraseña no son válidos' }
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
                { type: ALERTS.DANGER, message: 'Ha ocurrido un error inesperado.' }
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
                { type: ALERTS.DANGER, message: 'Ha ocurrido un error inesperado.' }
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
            console.log(err);
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
                console.log(err);
                dispatch({
                    type: USERS_FETCH_FAIL,
                });
            });
        }, err => {
            console.log(err);
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
                    { type: ALERTS.SUCCESS, message: 'Usuario creado satisfactoriamente' }
                ]));
            }, err => {
                console.log(err);
                dispatch(hideOverlay());
                dispatch({ type: USER_CREATE_FAIL });
                dispatch(notifications([
                    { type: ALERTS.DANGER, message: 'Hubo un error creando el usuario' }
                ]));
            });
        });
    };
};

export const deleteUser = (id, done, fail) =>
    (dispatch) => {
        dispatch({ type: USER_DELETE_DISPATCHED });
        token.through().then(header =>
            api({
                url: `/users/${id}`,
                method: 'DELETE',
                headers: header
            }).then(() => {
                done();
                dispatch({ type: USER_DELETE_SUCCESS });
            }, () => {
                fail();
                dispatch({ type: USER_DELETE_FAIL });
            })
        );
    };

export const editUser = (data, success, fail) =>
    (dispatch) => {
        dispatch({ type: USER_DELETE_DISPATCHED });
        token.through().then(header =>
            api({
                url: `/users/${data.id}`,
                method: 'PUT',
                headers: header
            }, data).then(() => {
                success();
                dispatch({ type: USER_UPDATE_SUCCESS });
            }, () => {
                fail();
                dispatch({ type: USER_UPDATE_FAIL });
            })
        );
    };

export const validateUserToken = (userToken) =>
    (dispatch) => api({
        url: `/user-tokens/${userToken}`,
        method: 'GET'
    }).then(resp => dispatch({ type: USER_TOKEN_FETCHED, payload: resp.data }));

export const clearUserToken = () =>
    (dispatch) => dispatch({ type: USER_TOKEN_CLEAR });

export const listenUserChanges = (userId) =>
    (dispatch) =>
        ws(USER_WS_CHANGED, `/${userId}`, () => {
            dispatch(fetchUser());
        });

export const updatePassword = (passwordObj, success, failed) =>
    () => api({
        url: '/account/activate-pass',
        method: 'POST'
    }, passwordObj).then(success, failed);
