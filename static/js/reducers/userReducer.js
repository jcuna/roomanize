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
import { STATUS } from '../constants';

export default function userReducer(state = {
    user: {
        status: STATUS.PENDING,
        roles: [],
        list: {
            status: STATUS.PENDING,
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
                user: { ...state.user, ...action.payload.user, status: STATUS.PROCESSED },
                token: action.payload.token,
            };
        case USER_MUST_LOGIN:
            return { ...state, user: { ...state.user, status: STATUS.UNPROCESSED }};
        case USER_LOGGING_IN:
            return { ...state, user: { ...state.user, status: STATUS.TRANSMITTING }};
        case USER_LOGIN_SUCCESS:
            return {
                ...state,
                user: { ...state.user, ...action.payload.user, status: STATUS.PROCESSED },
                token: action.payload.token,
            };
        case USER_LOGIN_FAIL:
            return {
                ...state,
                user: {
                    ...state.user,
                    status: STATUS.FAILED,
                    email: action.payload.email,
                    password: action.payload.password,
                },
            };
        case USER_LOGIN_ERROR:
            return {
                ...state,
                user: {
                    ...state.user,
                    status: STATUS.ERROR,
                    email: action.payload.email,
                    password: action.payload.password,
                },
            };
        case USER_LOGGING_OUT:
            return {
                ...state,
                user: { ...state.user, status: STATUS.DECOMMISSIONING },
            };
        case USER_LOGGED_OUT:
            return { ...state, user: { status: STATUS.DECOMMISSIONED, roles: [] }, token: { value: '', expires: '' }};

        case USERS_FETCHING:
            return { ...state, user: { ...state.user, list: { status: STATUS.TRANSMITTING, users: [] }}};
        case USERS_FETCHED:
            return { ...state, user: { ...state.user, list: { status: STATUS.COMPLETE, users: action.payload }}};

        case USER_CREATED:
        case USER_DELETE_SUCCESS:
        case USER_UPDATE_SUCCESS:
            return { ...state, user: { ...state.user, list: { status: STATUS.PENDING, users: [] }}};

        default:
            return state;
    }
}
