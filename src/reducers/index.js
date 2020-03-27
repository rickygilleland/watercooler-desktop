import { combineReducers } from "redux";
import { connectRouter } from 'connected-react-router'

import auth from './auth';
import user from './user';
import room from './room';

export default (history) => {
    const appReducer = combineReducers({
        router: connectRouter(history),
        auth,
        user,
        room,
    });

    const rootReducer = (state, action) => {
        if (action.type === 'USER_LOGOUT') {
            state = undefined;
        }

        return appReducer(state, action);
    }

    return rootReducer;
}

/*
export default (history) => combineReducers({
    router: connectRouter(history),
    auth,
    user,
    room,
})*/