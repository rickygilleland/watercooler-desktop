export const GET_THREAD_STARTED = 'GET_THREAD_STARTED';
export const GET_THREAD_SUCCESS = 'GET_THREAD_SUCCESS';
export const GET_THREAD_FAILURE = 'GET_THREAD_FAILURE';
export const GET_USER_THREADS_STARTED = 'GET_USER_THREADS_STARTED';
export const GET_USER_THREADS_SUCCESS = 'GET_USER_THREADS_SUCCESS';
export const GET_USER_THREADS_FAILURE = 'GET_USER_THREADS_FAILURE';

export function getThreadStarted() {
    return {
        type: GET_THREAD_STARTED
    }
} 

export function getThreadSuccess(payload) {
    return {
        type: GET_THREAD_SUCCESS,
        payload
    }
} 

export function getThreadFailure(payload) {
    return {
        type: GET_THREAD_FAILURE,
        payload
    }
} 

export function getUserThreadsStarted() {
    return {
        type: GET_USER_THREADS_STARTED
    }
} 

export function getUserThreadsSuccess(payload) {
    return {
        type: GET_USER_THREADS_SUCCESS,
        payload
    }
} 

export function getUserThreadsFailure(payload) {
    return {
        type: GET_USER_THREADS_FAILURE,
        payload
    }
} 

export function getThread(threadId) {
    return (dispatch, getState, axios) => {
        dispatch(getThreadStarted());
        const state = getState();

        try {
            axios({
                method: 'get',
                url: `https://blab.to/api/threads/${threadId}`,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+state.auth.authKey,
                }
            })
            .then(response => {
                dispatch(getThreadSuccess({ data: response.data}));
            })
            .catch(error => {
                dispatch(getThreadFailure({ error: error.message }));
            })
        } catch (error) {
            dispatch(getThreadFailure({ error: error }));
        }
    }
}

export function getUserThreads() {
    return (dispatch, getState, axios) => {
        dispatch(getUserThreadsStarted());
        const state = getState();

        try {
            axios({
                method: 'get',
                url: `https://blab.to/api/threads`,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+state.auth.authKey,
                }
            })
            .then(response => {
                dispatch(getUserThreadsSuccess({ data: response.data}));
            })
            .catch(error => {
                dispatch(getUserThreadsFailure({ error: error.message }));
            })
        } catch (error) {
            dispatch(getUserThreadsFailure({ error: error }));
        }
    }
}