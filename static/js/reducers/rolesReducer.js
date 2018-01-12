
import {
    ROLE_CREATE_SUCCESS, ROLES_FETCHING, ROLES_FETCHED, ROLES_FAIL,
    PERMISSIONS_FETCHED, PERMISSIONS_COMMIT, ROLE_DELETE_SUCCESS, ROLE_DELETE_FAILED, ROLE_CREATE_DISPATCHED,
    ROLE_DELETE_DISPATCHED, PERMISSIONS_COMMIT_FAILED
} from "../actions/roleActions";

export default function rolesReducer(state = {
    roles: {
        assigned: [],
        status: 'pending',
        permissions: {},
        processing: false
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
        case ROLE_CREATE_DISPATCHED:
            return {...state, roles: {...state.roles, processing: true}};
        case ROLE_CREATE_SUCCESS:
            let data = state.roles.assigned.slice();
            data.push(action.payload);
            return {...state, roles: {...state.roles, assigned: data.sort(rolesCompare), processing: false}};
        case PERMISSIONS_FETCHED:
            return {...state, roles: {...state.roles, permissions: action.payload}};
        case PERMISSIONS_COMMIT:
            let assigned = getUpdatedRolesPermissions(state, action.payload);
            return {...state, roles: {...state.roles, assigned: assigned, processing: false}};
        case PERMISSIONS_COMMIT_FAILED:
            return {...state, roles: {...state.roles, processing: false}};
        case ROLE_DELETE_DISPATCHED:
            return {...state, roles: {...state.roles, processing: true}};
        case ROLE_DELETE_SUCCESS:
            let assignedRoles = [];
            state.roles.assigned.forEach(r => {
                console.log(r.id, action.payload);
                if (r.id !== action.payload) {
                    assignedRoles.push(r);
                }
            });
            return {...state, roles: {...state.roles, assigned: assignedRoles, processing: false}};
        case ROLE_DELETE_FAILED:
            return {...state, roles: {...state.roles, processing: false}};
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
        if (item.id === payload.id) {
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