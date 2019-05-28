import {
    AGREEMENT_CLEAR,
    AGREEMENT_CREATED,
    AGREEMENT_SET,
    AGREEMENTS_FETCHED,
    AGREEMENTS_PROCESSING,
} from '../actions/agreementsAction';

const initialData = {
    processing: false,
    data: {
        page: 1,
        total_pages: 1,
        list: [],
    },
    agreement: {
        id: null,
        rate: null,
        interval: 0,
        entered_on: '',
        terminated_on: null,
        tenant: {
            name: '',
            identification_number: '',
            id: null,
        },
        tenant_history: {
            reference1: '',
            reference2: '',
            reference3: '',
        },
        room: {
            name: '',
            id: '',
        },
    },
};

export default function agreementsReducer(state = initialData, action) {
    switch (action.type) {
        case AGREEMENTS_FETCHED:
            return { ...state, data: action.payload, processing: false };
        case AGREEMENTS_PROCESSING:
            return { ...state, processing: true };
        case AGREEMENT_CLEAR:
            return { ...state, agreement: { ...initialData.agreement }};
        case AGREEMENT_SET:
            const agreement = { ...state.agreement };

            Object.keys(initialData.agreement).forEach(key => {
                if (typeof action.payload[key] !== 'undefined') {
                    agreement[key] = { ...action.payload[key] };
                }
            });

            return { ...state, agreement };
        case AGREEMENT_CREATED:
            return { ...state, agreement: { ...state.agreement, id: action.payload }};
        default:
            return state;
    }
}
