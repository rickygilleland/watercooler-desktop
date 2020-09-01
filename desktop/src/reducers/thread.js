import { Action } from 'redux';
import { 
    GET_THREAD_STARTED, 
    GET_THREAD_SUCCESS,
    GET_THREAD_FAILURE,
    GET_USER_THREADS_STARTED, 
    GET_USER_THREADS_SUCCESS,
    GET_USER_THREADS_FAILURE,
    GET_THREAD_MESSAGES_STARTED, 
    GET_THREAD_MESSAGES_SUCCESS,
    GET_THREAD_MESSAGES_FAILURE,
} from '../actions/thread';

const initialState = {
    threads: [],
    loading: false,
    error: false
}

export default function thread(state = initialState, action = {}) {
    var updatedState = {};
    switch (action.type) {
        case GET_THREAD_STARTED:
            updatedState = {
                loading: true,
                error: false
            }
            break;
        case GET_THREAD_SUCCESS:
            var updatedThreads = [...state.threads];

            var updated = false;
            updatedThreads.forEach(thread => {
                if (thread.id == action.payload.data.id) {
                    thread = action.payload.data;
                    updated = true;
                }
            })

            if (!updated) {
                updatedThreads.push(action.payload.data);
            }

            updatedState = {
                threads: updatedThreads,
                loading: false,
                error: false,
            }
            break;
        case GET_THREAD_FAILURE:
            updatedState = {
                loading: false,
                error: true,
            }
            break;
        case GET_USER_THREADS_STARTED:
            updatedState = {
                loading: true,
                error: false
            }
            break;
        case GET_USER_THREADS_SUCCESS:
            updatedState = {
                threads: action.payload.data,
                loading: false,
                error: false,
            }
            break;
        case GET_USER_THREADS_FAILURE:
            updatedState = {
                loading: false,
                error: true,
            }
            break;
        case GET_THREAD_MESSAGES_STARTED:
            updatedState = {
                loading: true,
                error: false
            }
            break;
        case GET_THREAD_MESSAGES_SUCCESS:
            var updatedThreads = [...state.threads];

            updatedThreads.forEach(thread => {
                if (thread.id == action.payload.data.id) {
                    thread.messages = action.payload.data.messages;
                }
            })

            updatedState = {
                threads: updatedThreads,
                loading: false,
                error: false,
            }
            break;
        case GET_THREAD_MESSAGES_FAILURE:
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