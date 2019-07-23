import {
    EXPENSE_FETCHED,
    EXPENSE_FETCHING,
    EXPENSE_TOKEN_CLEAR,
    EXPENSE_CREATED,
    EXPENSE_CREATING
} from '../actions/expenseActions';

const initialData = {
    processing: false,
    domain: null,
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
            return { ...state, processing: true, data: { ...state.data, list: [] }};
        case EXPENSE_CREATING:
            return { ...state, processing: true };
        case EXPENSE_FETCHED:
            return { ...state, processing: false, data: payload };
        case EXPENSE_CREATED:
            return { ...state, processing: false, domain: payload.domain, token: payload.token };
        case EXPENSE_TOKEN_CLEAR:
            return { ...state, domain: null, token: null, scans: [] };
        default:
            return state;
    }
}
