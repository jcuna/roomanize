import {
    PAYMENT_TYPES_FETCHED,
    PROJECT_EDITING,
    PROJECT_EDITING_CLEAR,
    PROJECT_REQUIRED,
    PROJECTS_FETCHED, REPORT_CLEAR, REPORT_FETCHED, REPORT_FETCHING, REPORTS_FETCHED,
    TIME_INTERVALS_FETCHED,
} from '../actions/projectActions';
import { STATUS } from '../constants';

const editingInitState = {
    name: '',
    contact: '',
    address: '',
    active: false,
    id: '',
};

const currentProjectInitState = {
    total_expenses: '',
    from_date: '',
    revenue: '',
    expenses: [],
    income: [],
    to_date: '',
    project: {},
    report_day: '',
    address: '',
    project_id: '',
    total_income: '',
    uid: '',
};

export default function projectReducer(state = {
    status: STATUS.PENDING,
    editing: editingInitState,
    projects: [],
    requiresProject: false,
    timeIntervals: [],
    paymentTypes: [],
    reportsStatus: STATUS.PENDING,
    currentReport: currentProjectInitState,
    reports: [],
    lastReportKey: null,
}, action) {
    switch (action.type) {
        case PROJECTS_FETCHED:
            return {
                ...state, status: STATUS.COMPLETE, projects: action.payload.projects
            };
        case PROJECT_REQUIRED:
            return {
                ...state, requiresProject: !state.requiresProject
            };
        case PROJECT_EDITING:
            return {
                ...state, editing: action.payload
            };
        case PROJECT_EDITING_CLEAR:
            return {
                ...state, editing: editingInitState
            };
        case TIME_INTERVALS_FETCHED:
            return { ...state, timeIntervals: action.payload };
        case PAYMENT_TYPES_FETCHED:
            return { ...state, paymentTypes: action.payload };
        case REPORT_FETCHING:
            return { ...state, reportsStatus: STATUS.TRANSMITTING };
        case REPORT_FETCHED:
            return { ...state, currentReport: action.payload, reportsStatus: STATUS.COMPLETE };
        case REPORT_CLEAR:
            return { ...state, currentReport: currentProjectInitState };
        case REPORTS_FETCHED:
            return {
                ...state,
                reports: action.payload.items,
                lastReportKey: action.payload.end_key,
                reportsStatus: STATUS.COMPLETE
            };
        default:
            return state;
    }
}

