import { STATUS } from '../constants';

export const routes = [
    { icon: 'fas fa-bed', link: '/habitaciones', name: 'Habitaciones', endpoint: 'rooms_url' },
    { icon: 'fas fa-file-contract', link: '/contratos', name: 'Contratos', endpoint: 'agreements_url' },
    { icon: 'fas fa-people-carry', link: '/inquilinos', name: 'Inquilinos', endpoint: 'tenants_url' },
    { icon: 'fas fa-lock', link: '/roles', name: 'Roles', endpoint: 'roles_url' },
    { icon: 'fas fa-users', link: '/usuarios', name: 'Usuarios', endpoint: 'users_manager_url' },
    { icon: 'fas fa-chart-line', link: '/proyectos', name: 'Proyectos', endpoint: 'projects_url' },
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
    const length = routes.length;

    for (let i = 0; i < length; i++) {
        const item = routes[i];

        if (typeof item.endpoint !== 'undefined' && item.endpoint !== '' && item.link === path) {
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
