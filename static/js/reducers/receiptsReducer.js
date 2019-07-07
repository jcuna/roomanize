import { RECEIPTS_FETCHED, RECEIPTS_FETCHING } from '../actions/receiptsActions';

const initialData = {
    processing: false,
    data: {
        page: 1,
        total_pages: 1,
        list: [],
    },
};

export default function receiptsReducer(state = initialData, action) {
    switch (action.type) {
        case RECEIPTS_FETCHING:
            return { ...state, processing: true, data: { ...state.data, list: [] }};
        case RECEIPTS_FETCHED:
            return { ...state, processing: false, data: action.payload };
        default:
            return state;
    }
}
