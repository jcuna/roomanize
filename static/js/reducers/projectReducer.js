import { PROJECT_EDITING, PROJECT_EDITING_CLEAR, PROJECT_REQUIRED, PROJECTS_FETCHED } from '../actions/projectActions';
import { STATUS } from '../constants';

const editingInitState = {
    name: '',
    contact: '',
    address: '',
    active: false,
    id: ''
};

export default function projectReducer(state = {
    status: STATUS.PENDING,
    selected: null,
    editing: editingInitState,
    projects: [],
    requiresProject: false
}, action) {
    switch (action.type) {
        case PROJECTS_FETCHED:
            return {
                ...state, status: STATUS.COMPLETE, selected: action.payload.selected, projects: action.payload.projects
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

        default:
            return state;
    }
}

