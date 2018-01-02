import {combineReducers} from 'redux'
import appReducer from './appReducer'
import userReducer from './userReducer'
import rolesReducer from "./rolesReducer";

export default combineReducers({
    app: appReducer,
    user: userReducer,
    roles: rolesReducer
});
