import { combineReducers } from "redux";
import { connectRouter } from 'connected-react-router'
import { push } from 'connected-react-router';

import auth from './auth';
import user from './user';
import room from './room';
import organization from './organization';

export default (history) => {
    const appReducer = combineReducers({
        router: connectRouter(history),
        auth,
        user,
        room,
        organization,
    });

    const rootReducer = (state, action) => {
        if (action.type === 'USER_LOGOUT') {
            state = undefined;
        }

        //state = undefined;

        if (typeof action.payload !== 'undefined' 
            && (typeof action.payload.error !== 'undefined' && action.payload.error == "Request failed with status code 401")) {
            state = undefined;
        }

        return appReducer(state, action);
    }

    return rootReducer;
}