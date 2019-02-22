import { ENDPOINTS, STATUS } from '../constants';

export const getEndpoint = (endpoint) => {
    let value = null;

    Object.keys(ENDPOINTS).forEach(name => {
        if (endpoint === ENDPOINTS[name]) {
            value = name.toLowerCase();
        }
    });
    return value;
};

export const menuItems = [
    {
        icon: 'fas fa-bed',
        link: ENDPOINTS.ROOMS_URL,
        name: 'Habitaciones',
        endpoint: getEndpoint(ENDPOINTS.ROOMS_URL)
    },
    {
        icon: 'fas fa-file-contract',
        link: ENDPOINTS.AGREEMENTS_URL,
        name: 'Contratos',
        endpoint: getEndpoint(ENDPOINTS.AGREEMENTS_URL)
    },
    {
        icon: 'fas fa-people-carry',
        link: ENDPOINTS.TENANTS_URL,
        name: 'Inquilinos',
        endpoint: getEndpoint(ENDPOINTS.TENANTS_URL)
    },
    {
        icon: 'fas fa-lock',
        link: ENDPOINTS.ROLES_URL,
        name: 'Roles',
        endpoint: getEndpoint(ENDPOINTS.ROLES_URL)
    },
    {
        icon: 'fas fa-users',
        link: ENDPOINTS.USERS_MANAGER_URL,
        name: 'Usuarios',
        endpoint: getEndpoint(ENDPOINTS.USERS_MANAGER_URL)
    },
    {
        icon: 'fas fa-chart-line',
        link: ENDPOINTS.PROJECTS_URL,
        name: 'Proyectos',
        endpoint: getEndpoint(ENDPOINTS.PROJECTS_URL)
    },
];

let state = {};

export const setStateData = (props) => {
    state = { ...props };
};

export const hasAccess = (path, type) => {
    if (typeof state.user === 'undefined' || state.user.status !== STATUS.PROCESSED ||
        Object.keys(state.roles.permissions).length === 0) {
        return false;
    }

    if (path.indexOf('/') !== 0) {
        path = `/${path}`;
    }
    let access = true;
    const endpoints = Object.keys(ENDPOINTS);
    const length = endpoints.length;

    for (let i = 0; i < length; i++) {
        const item = ({
            endpoint: endpoints[i].toLowerCase(),
            uri: ENDPOINTS[endpoints[i]]
        });

        if (item.uri === path) {
            access = false;
            for (let j = 0; j < state.user.roles.length; j++) {
                const role = state.user.roles[j];
                const perm = state.roles.permissions[item.endpoint];

                if (typeof role.permissions[perm] === 'undefined') {
                    access = false;
                    break;
                } else if (role.permissions[perm].includes(type)) {
                    access = true;
                    break;
                }
            }
        }
    }

    return access;
};
