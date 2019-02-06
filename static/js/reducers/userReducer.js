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
    USER_LOGGED_OUT,
    USERS_FETCHED,
    USER_CREATED,
    USERS_FETCHING,
    USER_DELETE_SUCCESS,
    USER_UPDATE_SUCCESS,
    USER_TOKEN_CLEAR, USER_TOKEN_FETCHED,
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
        pic: null,
        // a user token used to validate or verify a multi factor request
        userToken: {
            status: STATUS.PENDING,
            isValid: false
        },
        attributes: {
            preferences: {},
            access: {}
        }
    },
    // jwt session token, expires regularly
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
                user: { ...state.user, ...action.payload.user, list: state.user.list, status: STATUS.PROCESSED },
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
                    list: state.user.list,
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

        case USER_TOKEN_CLEAR:
            return { ...state, user: { ...state.user, userToken: {
                status: STATUS.PENDING,
                isValid: false
            }}};

        case USER_TOKEN_FETCHED:
            return { ...state, user: { ...state.user, userToken: {
                status: STATUS.COMPLETE,
                isValid: action.payload.isValid
            }}};

        default:
            return state;
    }
}
