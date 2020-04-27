import { Action } from 'redux';
import { GET_ROOMS_SUCCESS, GET_ROOMS_FAILURE } from '../actions/room';

const initialState = {
    rooms: [],
    error: false,
}

export default function room(state = initialState, action = {}) {
    var updatedState = {};
    switch (action.type) {
        case GET_ROOMS_SUCCESS:
            updatedState = {
                rooms: action.payload.data.teams
            }
            break;
        case GET_ROOMS_FAILURE:
            updatedState = {
                error: true
            }
            return state;
        default:
            //do nothing
            return state;
    }
    const newState = Object.assign({}, state, updatedState);
    return newState;
};