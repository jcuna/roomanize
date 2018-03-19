/**
 * Created by Jon on 12/4/17.
 */

import {
    USER_FETCHED,
    USER_MUST_LOGIN,
    USER_LOGGING_IN,
    USER_LOGIN_SUCCESS,
    USER_LOGIN_FAIL,
    USER_LOGIN_ERROR,
    USER_LOGGING_OUT,
    USER_LOGGED_OUT
} from '../actions/userActions';

export default function userReducer(state = {
    user: {
        status: 'pending',
        roles: [],
        list: []
    },
    token: {
        value: '',
        expires: ''
    }
}, action) {
    switch(action.type) {
        case USER_FETCHED:
            return {
                ...state,
                user: {...action.payload.user, status: 'logged_in', list: []},
                token: action.payload.token
            };
        case USER_MUST_LOGIN:
            return {...state, user: {...state.user, status: 'logged_out'}, list: []};
        case USER_LOGGING_IN:
            return {...state, user: {...state.user, status: 'logging_in'}, list: []};
        case USER_LOGIN_SUCCESS:
            return {
                ...state,
                user: {...action.payload.user, status: 'logged_in', list: []},
                token: action.payload.token,
            };
        case USER_LOGIN_FAIL:
            return {
                ...state,
                user: {
                    ...state.user,
                    status: 'failed',
                    email: action.payload.email,
                    password: action.payload.password,
                    list: []
                }
            };
        case USER_LOGIN_ERROR:
            return {
                ...state,
                user: {
                    ...state.user,
                    status: 'error',
                    email: action.payload.email,
                    password: action.payload.password,
                    list: []
                }
            };
        case USER_LOGGING_OUT:
            return {
                ...state,
                user: {...state.user, status: 'logging_out'},
                list: []
            };
        case USER_LOGGED_OUT:
            return {...state, user: {status: 'logged_out', roles: []}, token: {value: '', expires: ''}, list: []};
        default:
            return state;
    }
}