import api from '../utils/api';
import { token } from '../utils/token';

export const PROJECT_UPDATING = 'PROJECT_UPDATING';
export const PROJECT_UPDATED = 'PROJECT_UPDATED';
export const PROJECT_CREATING = 'PROJECT_CREATING';
export const PROJECT_CREATED = 'PROJECT_CREATED';
export const PROJECTS_FETCHING = 'PROJECTS_FETCHING';
export const PROJECTS_FETCHED = 'PROJECTS_FETCHED';
export const PROJECTS_FETCHED_FAIL = 'PROJECTS_FETCHED_FAIL';
export const PROJECT_REQUIRED = 'PROJECT_REQUIRED';
export const PROJECT_EDITING = 'PROJECT_EDITING';
export const PROJECT_EDITING_CLEAR = 'PROJECT_EDITING_CLEAR';
export const TIME_INTERVALS_FETCHED = 'TIME_INTERVALS_FETCHED';

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
        dispatch({ type: PROJECT_UPDATING });
        token.through().then(header =>
            api({
                url: `/projects/${data.id}`,
                method: 'PUT',
                headers: header
            }, data).then((resp) => {
                success();
                dispatch({ type: PROJECT_UPDATED, payload: { id: resp.id }});
            })
        );
    };

export const editProject = (project) =>
    (dispatch) => {
        dispatch({ type: PROJECT_EDITING, payload: project });
    };

export const clearProjectEditing = () =>
    (dispatch) => {
        dispatch({ type: PROJECT_EDITING_CLEAR });
    };

export const fetchTimeIntervals = () =>
    (dispatch) => {
        token.through().then(header => {
            return api({
                url: '/time-intervals',
                method: 'GET',
                headers: header,
            }).then(resp => dispatch({ type: TIME_INTERVALS_FETCHED, payload: resp.data }));
        });
    };
