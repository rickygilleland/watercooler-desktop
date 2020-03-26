import { Action } from 'redux';
import { GET_USER_DETAILS_SUCCESS, GET_USER_DETAILS_FAILURE } from '../actions/user';

const initialState = {
}

export default function user(state = initialState, action = {}) {
    var updatedState = {};
    switch (action.type) {
        case GET_USER_DETAILS_SUCCESS:
            updatedState = action.response
            break;
        case GET_USER_DETAILS_FAILURE:
            break;
        default:
            //do nothing
            break;
    }
    const newState = Object.assign({}, state, updatedState);
    return newState;
};