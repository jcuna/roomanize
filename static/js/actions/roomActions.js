import api from '../utils/api';
import { token } from '../utils/token';

export const ROOM_CREATED = 'ROOM_CREATED';
export const ROOM_SELECTED = 'ROOM_SELECTED';
export const ROOMS_FETCHING = 'ROOMS_FETCHING';
export const ROOMS_FETCHED = 'ROOMS_FETCHED';

export const createRoom = (data, resolve, reject) =>
    (dispatch) =>
        token.through().then(header => api({
            url: 'rooms',
            method: 'POST',
            headers: header,
        }, data).then(resp => {
            if (resp.status < 300) {
                dispatch({ type: ROOM_CREATED, payload: resp });
                resolve(resp.data);
            } else {
                reject(resp);
            }
        }, reject), reject);

export const fetchRooms = (page, reject) =>
    (dispatch) => {
        dispatch({ type: ROOMS_FETCHING });
        token.through().then(header => api({
            url: `rooms/${ page }`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            if (resp.status < 300) {
                dispatch({ type: ROOMS_FETCHED, payload: resp.data });
            } else {
                reject(resp);
            }
        }, reject), reject);
    };

export const selectRoom = (room) => {
    return { type: ROOM_SELECTED, payload: room };
};
