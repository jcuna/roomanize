import { combineReducers } from 'redux';
import appReducer from './appReducer';
import userReducer from './userReducer';
import rolesReducer from './rolesReducer';
import projectReducer from './projectReducer';
import roomReducer from './roomReducer';
import tenantsReducer from './tenantsReducer';
import agreementsReducer from './agreementsReducer';
import receiptsReducer from './receiptsReducer';
import expenseReducer from './expenseReducer';

export default combineReducers({
    app: appReducer,
    user: userReducer,
    roles: rolesReducer,
    projects: projectReducer,
    rooms: roomReducer,
    tenants: tenantsReducer,
    agreements: agreementsReducer,
    receipts: receiptsReducer,
    expenses: expenseReducer,
});
