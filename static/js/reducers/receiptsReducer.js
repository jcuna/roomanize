import { BALANCE_FETCHED, RECEIPTS_FETCHED, RECEIPTS_FETCHING } from '../actions/receiptsActions';

const initialData = {
    processing: false,
    data: {
        page: 1,
        total_pages: 1,
        list: [],
    },
    selectedBalance: {
        id: 0,
        agreement_id: 0,
        balance: 0,
        previous_balance: 0,
        created_on: null,
        due_date: null,
    }
};

export default function receiptsReducer(state = initialData, action) {
    switch (action.type) {
        case RECEIPTS_FETCHING:
            return { ...state, processing: true, data: { ...state.data, list: [] }};
        case RECEIPTS_FETCHED:
            return { ...state, processing: false, data: action.payload };
        case BALANCE_FETCHED:
            return { ...state, selectedBalance: action.payload };
        default:
            return state;
    }
}
