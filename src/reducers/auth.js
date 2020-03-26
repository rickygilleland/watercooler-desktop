import { Action } from 'redux';
import { GET_USER, AUTHENTICATE_USER_SUCCESS, AUTHENTICATE_USER_FAILURE, SET_REDIRECT_URL } from '../actions/auth';

const initialState = {
    isLoggedIn: false,
    authKey: null,
    refreshKey: null,
    loginError: false,
    redirectUrl: "/",
    user: {}
}

export default function auth(state = initialState, action = {}) {
    var updatedState = {};
    switch (action.type) {
        case GET_USER:
            //do something
            break;
        case AUTHENTICATE_USER_SUCCESS:
            updatedState = {
                authKey: action.authKey,
                refreshKey: action.refreshKey,
                isLoggedIn: true
            }
            break;
        case AUTHENTICATE_USER_FAILURE:
            updatedState = {
                loginError: true
            }
            break;
        case SET_REDIRECT_URL:
            updatedState = {
                redirectUrl: action.redirectUrl,
            }
            break;
        default:
            //do nothing
            break;
    }

    const newState = Object.assign({}, state, updatedState);
    return newState;
};