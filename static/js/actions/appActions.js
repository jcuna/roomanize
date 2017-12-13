
export const TOGGLE_MOBILE_MENU = "TOGGLE_MOBILE_MENU";
export const NOTIFICATIONS = "NOTIFICATIONS";
export const CLEAR_NOTIFICATIONS = "CLEAR_NOTIFICATIONS";
export const SET_LANDING_PAGE = "SET_LANDING_PAGE";
export const CLEAR_LANDING_PAGE = "CLEAR_LANDING_PAGE";

export function toggleMobileMenu(currentValue) {
    return function (dispatch) {
        return dispatch({
            type: TOGGLE_MOBILE_MENU,
            payload: !currentValue
        });
    }
}

export function notifications(messages) {
    if (!Array.isArray(messages)) {
        messages = [messages];
    }
    return {
        type: NOTIFICATIONS,
        payload: messages
    };
}

export function clearNotifications() {
    return {
        type: CLEAR_NOTIFICATIONS,
    };
}

export function setLandingPage(landingPage) {
    return {
        type: SET_LANDING_PAGE,
        payload: landingPage
    }
}

export function clearLandingPage() {
    return {
        type: CLEAR_LANDING_PAGE
    }
}