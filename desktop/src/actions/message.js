export const CREATE_MESSAGE_STARTED = 'CREATE_MESSAGE_STARTED';
export const CREATE_MESSAGE_SUCCESS = 'CREATE_MESSAGE_SUCCESS';
export const CREATE_MESSAGE_FAILURE = 'CREATE_MESSAGE_FAILURE';

export function createMessageStarted() {
    return {
        type: CREATE_MESSAGE_STARTED
    }
} 

export function createMessageSuccess(payload) {
    return {
        type: CREATE_MESSAGE_SUCCESS,
        payload
    }
} 

export function createMessageFailure(payload) {
    return {
        type: CREATE_MESSAGE_FAILURE,
        payload
    }
} 


export function createMessage(message) {
    return (dispatch, getState, axios) => {
        dispatch(createMessageStarted());
        const state = getState();

        try {
            axios({
                method: 'post',
                url: `https://blab.to/api/messages`,
                data: message,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+state.auth.authKey,
                }
            })
            .then(response => {
                dispatch(createMessageSuccess({ data: response.data}));
            })
            .catch(error => {
                dispatch(createMessageFailure({ error: error.message }));
            })
        } catch (error) {
            dispatch(createMessageFailure({ error: error }));
        }
    }
}