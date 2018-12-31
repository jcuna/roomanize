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
    USER_LOGGED_OUT, USERS_FETCHED, USER_CREATED, USERS_FETCHING, USER_DELETE_SUCCESS, USER_UPDATE_SUCCESS,
} from '../actions/userActions';

export default function userReducer(state = {
    user: {
        status: 'pending',
        roles: [],
        list: {
            status: 'pending',
            users: [],
        },
        pic: null
    },
    token: {
        value: '',
        expires: '',
    },
}, action) {
    switch (action.type) {
        case USER_FETCHED:
            return {
                ...state,
                user: { ...state.user, ...action.payload.user, status: 'logged_in' },
                token: action.payload.token,
            };
        case USER_MUST_LOGIN:
            return { ...state, user: { ...state.user, status: 'logged_out' }};
        case USER_LOGGING_IN:
            return { ...state, user: { ...state.user, status: 'logging_in' }};
        case USER_LOGIN_SUCCESS:
            return {
                ...state,
                user: { ...state.user, ...action.payload.user, status: 'logged_in' },
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
                },
            };
        case USER_LOGIN_ERROR:
            return {
                ...state,
                user: {
                    ...state.user,
                    status: 'error',
                    email: action.payload.email,
                    password: action.payload.password,
                },
            };
        case USER_LOGGING_OUT:
            return {
                ...state,
                user: { ...state.user, status: 'logging_out' },
            };
        case USER_LOGGED_OUT:
            return { ...state, user: { status: 'logged_out', roles: [] }, token: { value: '', expires: '' }};

        case USERS_FETCHING:
            return { ...state, user: { ...state.user, list: { status: 'fetching', users: [] }}};
        case USERS_FETCHED:
            return { ...state, user: { ...state.user, list: { status: 'fetched', users: action.payload }}};

        case USER_CREATED:
        case USER_DELETE_SUCCESS:
        case USER_UPDATE_SUCCESS:
            return { ...state, user: { ...state.user, list: { status: 'pending', users: [] }}};

        default:
            return state;
    }
}
