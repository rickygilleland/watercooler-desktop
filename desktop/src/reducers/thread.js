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
    privateThreads: [],
    publicThreads: [],
    sharedThreads: [],
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
            var updatedThreads;
            var keyToUpdate = null;

            if (action.payload.data.type == "private") {
                keyToUpdate = "privateThreads";
                updatedThreads = [...state.privateThreads];
            }

            if (action.payload.data.type == "public") {
                keyToUpdate = "publicThreads";
                updatedThreads = [...state.publicThreads];
            }

            if (action.payload.data.type == "shared") {
                keyToUpdate = "sharedThreads";
                updatedThreads = [...state.sharedThreads];
            }

            if (keyToUpdate == null) {
                return state;
            }

            updatedThreads = [...state[keyToUpdate]];

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
                [keyToUpdate]: updatedThreads,
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
            var currentPrivateThreads = [...state.privateThreads];
            var newPrivateThreads = [...action.payload.data.private_threads];
            var newPublicThreads = [...action.payload.data.public_threads];
            var newSharedThreads = [...action.payload.data.shared_threads];

            newPrivateThreads.forEach(newThread => {
                currentPrivateThreads.forEach(curThread => {
                    if (curThread.id == newThread.id) {
                        newThread.messages = curThread.messages;
                    }
                })
            })

            updatedState = {
                privateThreads: newPrivateThreads,
                publicThreads: newPublicThreads,
                sharedThreads: newSharedThreads,
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
            var updatedThreads;
            var keyToUpdate = null;

            if (action.payload.data.type == "private") {
                keyToUpdate = "privateThreads";
                updatedThreads = [...state.privateThreads];
            }

            if (action.payload.data.type == "public") {
                keyToUpdate = "publicThreads";
                updatedThreads = [...state.publicThreads];
            }

            if (action.payload.data.type == "shared") {
                keyToUpdate = "sharedThreads";
                updatedThreads = [...state.sharedThreads];
            }

            if (keyToUpdate == null) {
                return state;
            }

            updatedThreads = [...state[keyToUpdate]];

            updatedThreads.forEach(thread => {
                if (thread.id == action.payload.data.id) {
                    thread.messages = action.payload.data.messages;
                }
            })

            updatedState = {
                [keyToUpdate]: updatedThreads,
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