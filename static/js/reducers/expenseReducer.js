import {
    EXPENSES_FETCHED,
    EXPENSE_FETCHED,
    EXPENSE_FETCHING,
    EXPENSE_CREATED,
    EXPENSE_CREATING, CLEAR_EXPENSES
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
    selected: { signed_urls: [] }
};

export default function receiptsReducer(state = initialData, { type, payload }) {
    switch (type) {
        case EXPENSE_FETCHING:
            return { ...state, processing: true, data: { ...initialData.data }, selected: { ...initialData.selected }};
        case EXPENSE_CREATING:
            return { ...state, processing: true };
        case EXPENSES_FETCHED:
            return { ...state, processing: false, data: payload };
        case EXPENSE_FETCHED:
            return { ...state, processing: false, selected: payload };
        case EXPENSE_CREATED:
            return { ...state, processing: false, domain: payload.domain, token: payload.token };
        case CLEAR_EXPENSES:
            return { ...initialData };
        default:
            return state;
    }
}
