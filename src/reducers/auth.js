import { Action } from 'redux';
import { AUTHENTICATE_USER_STARTED, AUTHENTICATE_USER_SUCCESS, AUTHENTICATE_USER_FAILURE, SET_REDIRECT_URL } from '../actions/auth';

const initialState = {
    isLoggedIn: false,
    authKey: null,
    loginError: false,
    redirectUrl: "/",
    loading: false,
}

export default function auth(state = initialState, action = {}) {
    var updatedState = {};
    switch (action.type) {
        case AUTHENTICATE_USER_SUCCESS:
            updatedState = {
                authKey: action.payload.authKey,
                isLoggedIn: true,
                loginError: false,
                loading: false
            }
            break;
        case AUTHENTICATE_USER_FAILURE:
            updatedState = {
                loginError: true,
                isLoggedIn: false,
                loading: false
            }
            break;
        case SET_REDIRECT_URL:
            updatedState = {
                redirectUrl: action.payload.redirectUrl,
            }
            break;
        case AUTHENTICATE_USER_STARTED:
            updatedState = {
                loading: true
            }
            break;
        default:
            //do nothing
            return state;
    }
    

    const newState = Object.assign({}, state, updatedState);
    return newState;
};