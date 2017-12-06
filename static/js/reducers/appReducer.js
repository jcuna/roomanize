/**
 * Created by Jon on 12/4/17.
 */

export default function appReducer(state = {
    showMobileMenu: false,
    flashMessages: []
}, action) {
    switch(action.type) {
        case "TOGGLE_MOBILE_MENU":
            return {...state, showMobileMenu: action.payload};
        case "FLASH_MESSAGE":
            return {...state, flashMessages: action.payload};
        case "CLEAR_FLASH_MESSAGES":
            return {...state, flashMessages: []};
        default:
            return state;
    }
}