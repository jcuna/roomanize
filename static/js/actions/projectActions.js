import api from '../utils/api';
import token from '../utils/token';
import urlEncode from 'query-string';
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
export const PAYMENT_TYPES_FETCHED = 'PAYMENT_TYPES_FETCHED';
export const PAYMENT_TYPES_FETCHED_FAILED = 'PAYMENT_TYPES_FETCHED_FAILED';
export const REPORT_FETCHING = 'REPORT_FETCHING';
export const REPORT_FETCHED = 'REPORT_FETCHED';
export const REPORTS_FETCHED = 'REPORTS_FETCHED';
export const REPORTS_FETCH_FAILED = 'REPORTS_FETCH_FAILED';
export const REPORT_CLEAR = 'REPORTS_FETCH_FAILED';

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
            }, err => {
                fail && fail(err);
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
                success(resp);
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
                success(resp);
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

export const fetchPaymentTypes = (fail) =>
    (dispatch) => {
        token.through().then(header =>
            api({
                url: '/payment-types',
                method: 'GET',
                headers: header
            }).then((resp) => {
                dispatch({ type: PAYMENT_TYPES_FETCHED, payload: resp.data });
            }, err => {
                fail && fail(err);
                dispatch({ type: PAYMENT_TYPES_FETCHED_FAILED });
            })
        );
    };

export const fetchReportByUid = (uid) =>
    (dispatch) => {
        dispatch({ type: REPORT_FETCHING });
        token.through().then(header =>
            api({
                url: `/reports/${uid}`,
                method: 'GET',
                headers: header
            }).then((resp) => {
                dispatch({ type: REPORT_FETCHED, payload: resp.data });
            }, err => {
                dispatch({ type: REPORTS_FETCH_FAILED, payload: err });
            })
        );
    };

export const fetchReports = (project_id, uid) =>
    (dispatch) => {
        dispatch({ type: REPORT_FETCHING });
        const q = { project_id };
        if (uid) {
            q.uid = uid;
        }
        token.through().then(header =>
            api({
                url: `/reports?${urlEncode.stringify(q)}`,
                method: 'GET',
                headers: header
            }).then((resp) => {
                dispatch({ type: REPORTS_FETCHED, payload: resp.data });
            }, err => {
                dispatch({ type: REPORTS_FETCH_FAILED, payload: err });
            })
        );
    };

export const setCurrentReport = (report) =>
    () => ({ type: REPORT_FETCHED, payload: report });

export const currentReportClear = () =>
    () => ({ type: REPORT_CLEAR });
