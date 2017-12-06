/**
 * Created by Jon on 12/4/17.
 */

export default function userReducer(state = {
    loggedIn: false,
    user: {},
    token: 'pending'
}, action) {
    switch(action.type) {
        case "USER_RECEIVED":
            return {
                ...state,
                loggedIn: true,
                user: action.payload.user,
                token: action.payload.token
            };
            break;
        case "USER_MUST_LOGIN":
            return {...state, token: 'expired'};
            break;
        default:
            return state;
    }
}