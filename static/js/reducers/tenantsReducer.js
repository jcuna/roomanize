import {
    TENANT_CREATED,
    TENANTS_FETCHED,
    TENANTS_PROCESSING,
    TENANTS_PROCESSING_FAILED,
    TENANT_SELECTED_CLEAR, TENANT_SELECTED_SET,
} from '../actions/tenantsAction';

const initialData = {
    processing: false,
    data: {
        page: 1,
        total_pages: 1,
        list: []
    },
    selectedTenant: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        identification_number: '',
        history: [],
        tenant_id: null
    },
};

export default function tenantsReducer(state = initialData, action) {
    switch (action.type) {
        case TENANTS_FETCHED:
            return { ...state, processing: false, data: action.payload };

        case TENANTS_PROCESSING:
            return { ...state, processing: true, data: { ...state.data, list: [] }};

        case TENANT_CREATED:
            return { ...state, processing: false, selectedTenant: action.payload };

        case TENANT_SELECTED_CLEAR:
            return {
                ...state, selectedTenant: initialData
            };

        case TENANT_SELECTED_SET:
            return { ...state, selectedTenant: action.payload };

        case TENANTS_PROCESSING_FAILED:
            return { ...state, processing: false };

        default:
            return state;
    }
}
