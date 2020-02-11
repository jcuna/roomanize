import token from '../utils/token';
import api from '../utils/api';
import { download_blob } from '../utils/helpers';

export const TOGGLE_MOBILE_MENU = 'TOGGLE_MOBILE_MENU';
export const NOTIFICATIONS_SET = 'NOTIFICATIONS_SET';
export const NOTIFICATIONS_CLEAR = 'NOTIFICATIONS_CLEAR';
export const LANDING_PAGE_SET = 'LANDING_PAGE_SET';
export const LANDING_PAGE_CLEAR = 'LANDING_PAGE_CLEAR';
export const OVERLAY_SHOW = 'OVERLAY_SHOW';
export const OVERLAY_HIDE = 'OVERLAY_HIDE';
export const CLICKED_CONTENT = 'CLICKED_CONTENT';
export const ONLINE_STATUS = 'ONLINE_STATUS';
export const APP_NEED_INSTALL = 'APP_NEED_INSTALL';
export const TOGGLE_CONTAINER = 'TOGGLE_CONTAINER';

export const toggleMobileMenu = (updatedValue) => {
    return function (dispatch) {
        return dispatch({
            type: TOGGLE_MOBILE_MENU,
            payload: updatedValue,
        });
    };
};

export const hideOverlay = () => {
    return { type: OVERLAY_HIDE };
};

/**
 *
 * @param {Object} messages - {[{type: string, message: string}]}
 * @returns {Function}
 */
export const notifications = (messages) => {
    if (!Array.isArray(messages)) {
        messages = [messages];
    }
    return function (dispatch) {
        dispatch({
            type: NOTIFICATIONS_SET,
            payload: messages,
        });
    };
};

export const clearNotifications = () => {
    return {
        type: NOTIFICATIONS_CLEAR,
    };
};

export const setLandingPage = (landingPage) => {
    return {
        type: LANDING_PAGE_SET,
        payload: landingPage,
    };
};

export const clearLandingPage = () => {
    return {
        type: LANDING_PAGE_CLEAR,
    };
};

export const clickedContent = () => {
    return {
        type: CLICKED_CONTENT,
    };
};

/**
 *
 * @param {Object} childComponent
 * @param {string} title
 * @param {boolean} closeButton
 * @param {Object} actionButton
 * @param {function} onClose
 * @returns {object}
 */
export const showOverlay = (childComponent, title = '', closeButton = false, actionButton = null, onClose = null) => {
    return {
        type: OVERLAY_SHOW, payload: {
            component: childComponent,
            title,
            closeButton,
            actionButton,
            onClose,
        },
    };
};

export const updateOnlineStatus = (isOffline) =>
    ({ type: ONLINE_STATUS, payload: isOffline });

export const needInstall = () =>
    ({ type: APP_NEED_INSTALL });

export const toggleContainer = () =>
    (dispatch) => dispatch({ type: TOGGLE_CONTAINER });

export const download_pdf = (filename, html, styles, extra_css = [], done, error, template = 'print.html') => {
    const data = {
        filename,
        template,
        html: btoa(window.encodeURI(html)),
        styles: btoa(window.encodeURI(styles)),
        extra_css: extra_css.map(u => btoa(window.encodeURI(u)))
    };
    return () => {
        return token.through().then(header =>
            api({
                url: '/to-pdf',
                method: 'POST',
                headers: header
            }, data).then(resp => {
                resp.blob().then(blob => {
                    done && done();
                    download_blob(blob, resp.headers.get('content-disposition').split('filename=').pop());
                }, error);
            }, error)
        );
    };
};
