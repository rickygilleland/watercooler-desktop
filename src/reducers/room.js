import { Action } from 'redux';
import { GET_ROOMS_SUCCESS, GET_ROOMS_FAILURE } from '../actions/room';

const initialState = {
    rooms: []
}

export default function room(state = initialState, action = {}) {
    var updatedState = {};
    switch (action.type) {
        case GET_ROOMS_SUCCESS:
            /*updatedState = {
                rooms: [

                ]
            }*/
            break;
        case GET_ROOMS_FAILURE:
            break;
        default:
            //do nothing
            break;
    }

    const newState = Object.assign({}, state, updatedState);
    return newState;
};