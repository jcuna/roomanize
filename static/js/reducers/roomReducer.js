/**
 * Created by Jon on 12/4/17.
 */

import { STATUS } from '../constants';
import { ROOM_SELECTED, ROOMS_FETCHED, ROOMS_FETCHING, ROOMS_SEARCHED, ROOMS_SEARCHING } from '../actions/roomActions';
import { PROJECT_UPDATING } from '../actions/projectActions';

const initState = {
    status: STATUS.PENDING,
    searchingBackEnd: false,
    data: {
        page: 1,
        total_pages: 1,
        list: [],
    },
    selectedRoom: {}
};

export default function roomReducer(state = initState, action) {
    switch (action.type) {
        case ROOMS_FETCHING:
            return { ...state, status: STATUS.TRANSMITTING };
        case ROOMS_FETCHED:
            return { ...state, status: STATUS.COMPLETE, data: action.payload };
        case ROOM_SELECTED:
            return { ...state, selectedRoom: action.payload };
        case ROOMS_SEARCHING:
            return { ...state, searchingBackEnd: true };
        case ROOMS_SEARCHED:
            return { ...state, searchingBackEnd: false };
        case PROJECT_UPDATING:
            return { ...initState };
        default:
            return state;
    }
}
