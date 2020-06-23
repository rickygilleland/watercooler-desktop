import { Action } from 'redux';
import { 
    GET_USER_DETAILS_SUCCESS, 
    GET_USER_DETAILS_FAILURE,
    UPDATE_USER_DETAILS_STARTED,
    UPDATE_USER_DETAILS_SUCCESS,
    UPDATE_USER_DETAILS_FAILURE
} from '../actions/user';

const initialState = {
}

export default function user(state = initialState, action = {}) {
    var updatedState = {};
    switch (action.type) {
        case GET_USER_DETAILS_SUCCESS:
            updatedState = action.payload.data
            break;
        case GET_USER_DETAILS_FAILURE:
            return state;
        case UPDATE_USER_DETAILS_STARTED: 
            return state;
        case UPDATE_USER_DETAILS_SUCCESS:
            updatedState = action.payload.data
            break;
        case UPDATE_USER_DETAILS_FAILURE:
            return state;
        default:
            //do nothing
            return state;
    }
    const newState = Object.assign({}, state, { ...state, ...updatedState });
    return newState;
};