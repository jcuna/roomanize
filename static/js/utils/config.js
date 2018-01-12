export const routes = [
    {link: "/nueva-habitacion", name: "Agregar habitación", endpoint: ""},
    {link: "/editar-habitacion", name: "Ver/Modificar habitación", endpoint: ""},
    {link: "/nuevo-contrato", name: "Nuevo Inquilino", endpoint: ""},
    {link: "/roles", name: "Roles", endpoint: "roles_url"},
    {link: "/users", name: "Usuarios", endpoint: "users_manager_url"}
];

let state = {};

export function setStateData(props) {
    state = {...props};
}

export function hasAccess(path) {

    if (state.user === undefined || state.user.status !== 'logged_in'
        || Object.keys(state.roles.permissions).length === 0) {
        return false;
    }

    if (path.indexOf('/') !== 0) {
        path = `/${path}`;
    }
    let hasAccess = true;
    const length = routes.length;

    for (let i = 0; i < length; i++) {
        let item = routes[i];
        if (item.endpoint !== undefined && item.endpoint !== "" && item.link === path) {
            for (let j = 0; j < state.user.roles.length; j++) {
                let role = state.user.roles[j];
                const perm = state.roles.permissions[item.endpoint];
                if (perm !== undefined && role.permissions[perm] === undefined) {
                    hasAccess = false;
                    break
                }
            }
        }
    }

    return hasAccess;
}