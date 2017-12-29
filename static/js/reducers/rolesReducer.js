
import {CREATE_ROLE_SUCCESS, ROLES_FETCHING, ROLES_RECEIVED, ROLES_FAILED} from "../actions/roleActions";

export default function rolesReducer(state = {
    roles: {
        data: [],
        status: 'pending'
    }
}, action) {
    switch(action.type) {
        case ROLES_RECEIVED:
            let roles = action.payload.sort(rolesCompare);
            return {...state, roles: {data: roles, status: 'received'}};
        case ROLES_FETCHING:
            return {...state, roles: {...state.roles, status: 'fetching'}};
        case ROLES_FAILED:
            return {...state, roles: {...state.roles, status: 'pending'}};
        case CREATE_ROLE_SUCCESS:
            let data = state.roles.data.slice();
            data.push(action.payload);
            return {...state, roles: {...state.roles, data: data.sort(rolesCompare)}};

        default:
            return state;
    }
}

const rolesCompare = function (a, b) {
    if (a.name < b.name) {
        return -1;
    } else if (a.name > b.name) {
        return 1;
    }
    return 0;
};