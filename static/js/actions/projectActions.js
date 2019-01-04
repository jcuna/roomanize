import api from '../utils/api';
import { token } from '../utils/token';

export const PROJECT_SELECTING = 'PROJECT_SELECTING';
export const PROJECT_SELECTED = 'PROJECT_SELECTED';
export const PROJECT_CREATING = 'PROJECT_CREATING';
export const PROJECT_CREATED = 'PROJECT_CREATED';
export const PROJECTS_FETCHING = 'PROJECTS_FETCHING';
export const PROJECTS_FETCHED = 'PROJECTS_FETCHED';
export const PROJECTS_FETCHED_FAIL = 'PROJECTS_FETCHED_FAIL';
export const PROJECT_REQUIRED = 'PROJECT_REQUIRED';

export const fetchProjects = (fail) =>
    (dispatch) => {
        dispatch({ type: PROJECTS_FETCHING });
        token.through().then(header =>
            api({
                url: `/projects`,
                method: 'GET',
                headers: header
            }).then((resp) => {
                dispatch({ type: PROJECTS_FETCHED, payload: resp.data });
            }, () => {
                fail();
                dispatch({ type: PROJECTS_FETCHED_FAIL });
            })
        );
    };

export const createProject = (data, success) =>
    (dispatch) => {
        dispatch({ type: PROJECT_CREATING });
        token.through().then(header =>
            api({
                url: `/projects`,
                method: 'POST',
                headers: header
            }, data).then((resp) => {
                success();
                dispatch({ type: PROJECT_CREATED, payload: { ...data, id: resp.id }});
            }));
    };

export const updateProject = (data, success) =>
    (dispatch) => {
        dispatch({ type: PROJECT_SELECTING });
        token.through().then(header =>
            api({
                url: `/projects/${data.id}`,
                method: 'PUT',
                headers: header
            }, data).then((resp) => {
                success();
                dispatch({ type: PROJECT_SELECTED, payload: { id: resp.id }});
            })
        );
    };
