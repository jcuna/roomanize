import {
    EXPENSE_FETCHED,
    EXPENSE_FETCHING,
    EXPENSE_TOKEN_CLEAR,
    EXPENSE_TOKEN_FETCHED,
    EXPENSE_TOKEN_FETCHING
} from '../actions/expenseActions';

const initialData = {
    processing: false,
    scan_url: null,
    token: null,
    scans: [],
    data: {
        page: 1,
        total_pages: 1,
        list: [],
    },
};

export default function receiptsReducer(state = initialData, { type, payload }) {
    switch (type) {
        case EXPENSE_FETCHING:
        case EXPENSE_TOKEN_FETCHING:
            return { ...state, processing: true, data: { ...state.data, list: [] }};
        case EXPENSE_FETCHED:
            return { ...state, processing: false, data: payload };
        case EXPENSE_TOKEN_FETCHED:
            return { ...state, processing: false, scan_url: payload.domain, token: payload.token };
        case EXPENSE_TOKEN_CLEAR:
            return { ...state, scan_url: null, token: null, scans: [] };
        default:
            return state;
    }
}
