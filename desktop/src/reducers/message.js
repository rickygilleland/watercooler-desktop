import { Action } from 'redux';
import { 
    CREATE_MESSAGE_STARTED, 
    CREATE_MESSAGE_SUCCESS,
    CREATE_MESSAGE_FAILURE,
} from '../actions/message';

const initialState = {
    messages: [],
    loading: false,
    error: false
}

export default function message(state = initialState, action = {}) {
    var updatedState = {};
    switch (action.type) {
        case CREATE_MESSAGE_STARTED:
            updatedState = {
                loading: true,
                error: false
            }
            break;
        case CREATE_MESSAGE_SUCCESS:
            updatedState = {
                loading: false,
                error: false,
            }
            break;
        case CREATE_MESSAGE_FAILURE:
            updatedState = {
                loading: false,
                error: true,
            }
            break;
        default:
            //do nothing
            return state;
    }
    const newState = Object.assign({}, state, { ...state, ...updatedState });
    return newState;
};