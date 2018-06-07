
import api from "../utils/api";
import {token} from "../utils/token";
import {notifications} from "./appActions";

export const ROLES_FETCHING = 'ROLES_FETCHING';
export const ROLES_FETCHED = 'ROLES_FETCHED';
export const ROLES_FAIL = 'ROLES_FAIL';
export const ROLE_CREATE_SUCCESS = 'ROLE_CREATE_SUCCESS';
export const ROLE_DELETE_SUCCESS = 'ROLE_DELETE_SUCCESS';
export const ROLE_DELETE_DISPATCHED = 'ROLE_DELETE_DISPATCHED';
export const ROLE_DELETE_FAIL = 'ROLE_DELETE_FAIL';
export const ROLE_CREATE_DISPATCHED = 'ROLE_CREATE_DISPATCHED';
export const ROLE_CREATE_FAIL = 'ROLE_CREATE_FAIL';
export const PERMISSIONS_FETCHING = 'PERMISSIONS_FETCHING';
export const PERMISSIONS_FETCHED = 'PERMISSIONS_FETCHED';
export const PERMISSIONS_COMMIT = 'PERMISSIONS_COMMIT';
export const PERMISSIONS_COMMIT_FAIL = 'PERMISSIONS_COMMIT_FAIL';

export function createRole(name) {
    return function (dispatch) {
        dispatch({type: ROLE_CREATE_DISPATCHED});
        token.through().then(header => {
            api({
                url: '/roles',
                method: 'POST',
                headers: header
            }, name).then(resp => {
                dispatch({
                    type: ROLE_CREATE_SUCCESS,
                    payload: resp.data
                });
            }, err => {
                dispatch({
                    type: ROLE_CREATE_FAIL,
                    payload: err
                });
            });
        });
    }
}

export function deleteRole(id) {
    return function (dispatch) {
        dispatch({type: ROLE_DELETE_DISPATCHED});
        token.through().then(token => api({
            url: '/roles',
            method: 'DELETE',
            headers: token
        }, id).then(resp => {
            if (resp.status < 300) {
                dispatch({
                    type: ROLE_DELETE_SUCCESS,
                    payload: id
                });
                dispatch(notifications([{
                    type: 'info',
                    message: 'Role borrado correctamente.'
                }]));
            } else {
                let message = 'No tienes accesso a borrar roles';
                if (resp.status === 409) {
                    message = 'No puedes borrar un rol que ha sido asignado a un usuario, ' +
                        'primero quitale el rol al usuario.'
                }
                dispatch({type: ROLE_DELETE_FAIL});
                dispatch(notifications([{
                    type: 'warning',
                    message: message
                }]));
            }
        }, err => {
                dispatch({type: ROLE_DELETE_FAIL});
                dispatch(notifications([{
                        type: 'warning',
                        message: 'Error inesperado'
                    }])
                );
            })
        );
    }
}

export function fetchRoles() {
    return function (dispatch) {
        dispatch({type: ROLES_FETCHING});
        token.through().then(header => api({
            url: '/roles',
            method: 'GET',
            headers: header
        }).then(resp => {
            dispatch({
                type: ROLES_FETCHED,
                payload: resp.data
            });
        }, err => {
            dispatch({type: ROLES_FAIL, payload: err})
        }), err => dispatch({type: ROLES_FAIL, payload: err}));
    }
}

export function fetchPermissions() {
    return function (dispatch) {
        dispatch({type: PERMISSIONS_FETCHING});
        token.through().then(header => {
            api({
                url: 'permissions',
                method: 'GET',
                headers: header
            }).then(resp => {
                dispatch({
                    type: PERMISSIONS_FETCHED,
                    payload: resp.data
                });
            }, err => {})
        }, err => {})
    }
}

export function commitPermissions(permissions) {
    return function (dispatch) {
        dispatch({type: ROLE_CREATE_DISPATCHED});
        token.through().then(header => api({
            url: 'roles',
            method: 'PUT',
            headers: header
        }, permissions).then(resp => {
            if (resp.status < 300) {
                dispatch({
                    type: PERMISSIONS_COMMIT,
                    payload: permissions
                });
                dispatch(notifications([{
                    type: 'success',
                    message: 'Acceso actualizado correctamente'
                }]));
            } else {
                dispatch({type: PERMISSIONS_COMMIT_FAIL});
                dispatch(notifications([{
                    type: 'warning',
                    message: 'No se pudo actualizar los accesos'
                }]));
            }
        }, err => {
            dispatch({type: PERMISSIONS_COMMIT_FAIL});
            dispatch(notifications([{
                type: 'warning',
                message: 'No se pudo actualizar los accesos'
            }]));
        }));
    }
}
