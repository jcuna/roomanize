/**
 * Created by Jon on 12/4/17.
 */

import { STATUS } from '../constants';
import { ROOM_SELECTED, ROOMS_FETCHED, ROOMS_FETCHING } from '../actions/roomActions';

export default function roomReducer(state = {
    status: STATUS.PENDING,
    data: {
        page: 1,
        list: []
    },
    selectedRoom: {}

}, action) {
    switch (action.type) {
        case ROOMS_FETCHING:
            return { ...state, status: STATUS.TRANSMITTING };
        case ROOMS_FETCHED:
            return { ...state, status: STATUS.COMPLETE, data: action.payload };
        case ROOM_SELECTED:
            return { ...state, selectedRoom: action.payload };
        default:
            return state;
    }
}
