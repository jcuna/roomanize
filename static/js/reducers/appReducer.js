/**
 * Created by Jon on 12/4/17.
 */

import {
    TOGGLE_MOBILE_MENU, NOTIFICATIONS_SET, NOTIFICATIONS_CLEAR, LANDING_PAGE_SET,
    LANDING_PAGE_CLEAR, OVERLAY_SHOW, OVERLAY_HIDE
} from '../actions/appActions';

export default function appReducer(state = {
    showMobileMenu: false,
    notifications: [],
    landingPage: '',
    overlay: {
        display: false,
        component: null,
        title: '',
        closeButton: false,
        actionButton: null
    }
}, action) {
    switch(action.type) {
        case TOGGLE_MOBILE_MENU:
            return {...state, showMobileMenu: action.payload};
        case NOTIFICATIONS_SET:
            return {...state, notifications: action.payload};
        case NOTIFICATIONS_CLEAR:
            return {...state, notifications: []};
        case LANDING_PAGE_SET:
            return {...state, landingPage: action.payload};
        case LANDING_PAGE_CLEAR:
            return {...state, landingPage: ''};
        case OVERLAY_SHOW:
            return {
                ...state,
                overlay: {
                    display: true,
                    component: action.payload.component,
                    title: action.payload.title,
                    closeButton: action.payload.closeButton || false,
                    actionButton: action.payload.actionButton || null
                }
            };
        case OVERLAY_HIDE:
            return {
                ...state,
                overlay: {
                    display: false,
                    component: null,
                    title: '',
                    closeButton: false,
                    actionButton: null
                }
            };
        default:
            return state;
    }
}