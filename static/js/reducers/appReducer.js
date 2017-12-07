/**
 * Created by Jon on 12/4/17.
 */

export default function appReducer(state = {
    showMobileMenu: false,
    notifications: [],
    landingPage: ''
}, action) {
    switch(action.type) {
        case "TOGGLE_MOBILE_MENU":
            return {...state, showMobileMenu: action.payload};
        case "NOTIFICATIONS":
            return {...state, notifications: action.payload};
        case "CLEAR_NOTIFICATIONS":
            return {...state, notifications: []};
        case "SET_LANDING_PAGE":
            return {...state, landingPage: action.payload};
        case "CLEAR_LANDING_PAGE":
            return {...state, landingPage: ''};
        default:
            return state;
    }
}