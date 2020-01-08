import api from '../utils/api';
import token from '../utils/token';

export const ROOM_CREATED = 'ROOM_CREATED';
export const ROOM_SELECTED = 'ROOM_SELECTED';
export const CLEAR_SELECTED_ROOM = 'CLEAR_SELECTED_ROOM';
export const ROOMS_FETCHING = 'ROOMS_FETCHING';
export const ROOMS_SEARCHING = 'ROOMS_SEARCHING';
export const ROOMS_SEARCHED = 'ROOMS_SEARCHED';
export const ROOMS_FETCHED = 'ROOMS_FETCHED';
export const ROOM_FETCHED = 'ROOM_FETCHED';
export const ROOM_HISTORY_FETCHED = 'ROOM_HISTORY_FETCHED';
export const ROOMS_CLEAR = 'ROOMS_CLEAR';

export const createRoom = (data, resolve, reject) =>
    (dispatch) =>
        token.through().then(header => api({
            url: '/rooms',
            method: 'POST',
            headers: header,
        }, data).then(resp => {
            dispatch({ type: ROOM_CREATED, payload: resp });
            resolve(resp.data);
        }, reject), reject);

export const editRoom = (data, resolve, reject) =>
    (dispatch) =>
        token.through().then(header => api({
            url: `/rooms/${data.id}`,
            method: 'PUT',
            headers: header,
        }, data).then(resp => {
            dispatch({ type: ROOM_CREATED, payload: resp });
            resolve(resp.data);
        }, reject), reject);

export const fetchRooms = (page, reject) =>
    (dispatch) => {
        dispatch({ type: ROOMS_FETCHING });
        token.through().then(header => api({
            url: `/rooms/?page=${ page }`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            dispatch({ type: ROOMS_FETCHED, payload: resp.data });
        }, reject), reject);
    };

export const selectRoom = (room) => {
    return { type: ROOM_SELECTED, payload: room };
};

export const clearSelectedRoom = () => {
    return { type: CLEAR_SELECTED_ROOM };
};

export const fetchRoom = (rom_id, reject) =>
    (dispatch) => {
        dispatch({ type: ROOMS_FETCHING });
        token.through().then(header => api({
            url: `/rooms/${rom_id}`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            dispatch(selectRoom(resp.data));
        }, reject), reject);
    };

export const fetchRoomHistory = (rom_id, page, resolve, reject) =>
    (dispatch) => {
        token.through().then(header => api({
            url: `/rooms-history/${rom_id}?page=${ page }`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            resolve && resolve(resp.data);
            dispatch({ type: ROOM_HISTORY_FETCHED, payload: resp.data });
        }, reject), reject);
    };

export const searchRooms = (q, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: ROOMS_SEARCHING });
        token.through().then(header => api({
            url: `/rooms?query=${q}`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            resolve && resolve(resp.data);
            dispatch({ type: ROOMS_SEARCHED });
        }, (err) => {
            dispatch({ type: ROOMS_SEARCHED });
            reject && reject(err);
        }), reject);
    };

export const clearRooms = () =>
    (dispatch) => dispatch({ type: ROOMS_CLEAR });
