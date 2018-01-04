
import {
    ROLE_CREATE_SUCCESS, ROLES_FETCHING, ROLES_FETCHED, ROLES_FAIL,
    PERMISSIONS_FETCHED, PERMISSIONS_COMMIT
} from "../actions/roleActions";

export default function rolesReducer(state = {
    roles: {
        assigned: [],
        status: 'pending',
        permissions: {}
    }
}, action) {
    switch(action.type) {
        case ROLES_FETCHED:
            let roles = action.payload.sort(rolesCompare);
            return {...state, roles: {...state.roles, assigned: roles, status: 'received'}};
        case ROLES_FETCHING:
            return {...state, roles: {...state.roles, status: 'fetching'}};
        case ROLES_FAIL:
            return {...state, roles: {...state.roles, status: 'pending'}};
        case ROLE_CREATE_SUCCESS:
            let data = state.roles.assigned.slice();
            data.push(action.payload);
            return {...state, roles: {...state.roles, assigned: data.sort(rolesCompare)}};
        case PERMISSIONS_FETCHED:
            return {...state, roles: {...state.roles, permissions: action.payload}};
        case PERMISSIONS_COMMIT:
            let assigned = getUpdatedRolesPermissions(state, action.payload);
            return {...state, roles: {...state.roles, assigned: assigned}};
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

const getUpdatedRolesPermissions = function (state, payload) {
    let assigned = [];
    state.roles.assigned.forEach((item => {
        if (item.id = payload.id) {
            assigned.push({
                id: item.id,
                name: item.name,
                permissions: payload.permissions
            });
        } else {
            assigned.push(item);
        }
    }));

    return assigned;
};