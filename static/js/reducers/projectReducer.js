import { PROJECT_REQUIRED, PROJECTS_FETCHED } from '../actions/projectActions';
import { STATUS } from '../constants';

export default function projectReducer(state = {
    status: STATUS.PENDING,
    selected: null,
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

        default:
            return state;
    }
}
