
export const TOGGLE_MOBILE_MENU = 'TOGGLE_MOBILE_MENU';
export const NOTIFICATIONS_SET = 'NOTIFICATIONS_SET';
export const NOTIFICATIONS_CLEAR = 'NOTIFICATIONS_CLEAR';
export const LANDING_PAGE_SET = 'LANDING_PAGE_SET';
export const LANDING_PAGE_CLEAR = 'LANDING_PAGE_CLEAR';
export const OVERLAY_SHOW = 'OVERLAY_SHOW';
export const OVERLAY_HIDE = 'OVERLAY_HIDE';

export function toggleMobileMenu(currentValue) {
    return function (dispatch) {
        return dispatch({
            type: TOGGLE_MOBILE_MENU,
            payload: !currentValue
        });
    }
}

/**
 *
 * @param messages {[{type: string, message: string}]}
 * @returns {Function}
 */
export function notifications(messages) {
    if (!Array.isArray(messages)) {
        messages = [messages];
    }
    return function (dispatch) {
        dispatch(hideOverlay());
        dispatch({
            type: NOTIFICATIONS_SET,
            payload: messages
        });
    };
}

export function clearNotifications() {
    return {
        type: NOTIFICATIONS_CLEAR,
    };
}

export function setLandingPage(landingPage) {
    return {
        type: LANDING_PAGE_SET,
        payload: landingPage
    }
}

export function clearLandingPage() {
    return {
        type: LANDING_PAGE_CLEAR
    }
}

/**
 *
 * @param childComponent {XML}
 * @param title {string}
 * @param closeButton {boolean}
 * @param actionButton {XML}
 * @returns {{type: String, payload: {component: XML, title: String, closeButton: boolean, actionButton: XML}}}
 */
export function showOverlay(childComponent, title, closeButton = false, actionButton = null) {
    return {
        type: OVERLAY_SHOW, payload: {
            component: childComponent,
            title: title,
            closeButton: closeButton,
            actionButton: actionButton
        }
    }
}

export function hideOverlay() {
    return {type: OVERLAY_HIDE}
}