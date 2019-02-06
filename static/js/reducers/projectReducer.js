import {
    PROJECT_EDITING,
    PROJECT_EDITING_CLEAR,
    PROJECT_REQUIRED,
    PROJECTS_FETCHED,
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

export default function projectReducer(state = {
    status: STATUS.PENDING,
    editing: editingInitState,
    projects: [],
    requiresProject: false,
    timeIntervals: []
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

        default:
            return state;
    }
}

