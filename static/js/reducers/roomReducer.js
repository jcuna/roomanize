/**
 * Created by Jon on 12/4/17.
 */

import { STATUS } from '../constants';
import {
    ROOM_SELECTED,
    ROOMS_CLEAR,
    ROOMS_FETCHED,
    ROOMS_FETCHING,
    ROOMS_SEARCHED,
    ROOMS_SEARCHING,
} from '../actions/roomActions';
import { PROJECT_UPDATING } from '../actions/projectActions';

const initState = {
    status: STATUS.PENDING,
    searchingBackEnd: false,
    data: {
        page: 1,
        total_pages: 1,
        list: [],
    },
    selectedRoom: {
        id: 0,
        project_id: 0,
        name: '',
        description: '',
        picture: null,
        reserved: false,
        rental_history: {
            page: 1,
            total_pages: 1,
            list: [],
        }
    }
};

export default function roomReducer(state = initState, action) {
    switch (action.type) {
        case ROOMS_FETCHING:
            return { ...state, status: STATUS.TRANSMITTING };
        case ROOMS_FETCHED:
            return { ...state, status: STATUS.COMPLETE, data: action.payload };
        case ROOM_SELECTED:
            return {
                ...state,
                selectedRoom: { ...initState.selectedRoom, ...action.payload },
                status: STATUS.COMPLETE
            };
        case ROOMS_SEARCHING:
            return { ...state, searchingBackEnd: true };
        case ROOMS_SEARCHED:
            return { ...state, searchingBackEnd: false };
        case ROOMS_CLEAR:
        case PROJECT_UPDATING:
            return { ...initState };
        default:
            return state;
    }
}
