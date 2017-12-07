/**
 * Created by Jon on 12/4/17.
 */

export default function userReducer(state = {
    user: {
        status: 'pending'
    },
    token: ''
}, action) {
    switch(action.type) {
        case "USER_RECEIVED":
            return {
                ...state,
                user: {...action.payload.user, status: 'logged_in'},
                token: action.payload.token
            };
            break;
        case "USER_MUST_LOGIN":
            return {...state, user: {status: 'logged_out'}};
            break;
        case "USER_LOGGING_IN":
            return {...state, user: {status: 'logging_in'}};
        case "USER_LOGIN_SUCCESSFUL":
            return {
                ...state,
                user: {...action.payload.user, status: 'logged_in'},
                token: action.payload.token,
            };
        case "USER_LOGIN_FAIL":
            return {
                ...state,
                user: {
                    status: 'failed',
                    email: action.payload.email,
                    password: action.payload.password
                }
            };
        case "USER_LOGIN_ERROR":
            return {
                ...state,
                user: {
                    status: 'error',
                    email: action.payload.email,
                    password: action.payload.password
                }
            };
            break;
        case "USER_LOGGING_OUT":
            return {
                ...state,
                user: {...state.user, status: 'logging_out'}
            };
        case "USER_LOGGED_OUT":
            return {...state, user: {status: 'logged_out'}, token: ''};
            break;
        default:
            return state;
    }
}