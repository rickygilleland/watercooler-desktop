export const AUTHENTICATE_USER_START = 'AUTHENTICATE_USER_START';
export const AUTHENTICATE_USER_SUCCESS = 'AUTHENTICATE_USER_SUCCESS';
export const AUTHENTICATE_USER_FAILURE = 'AUTHENTICATE_USER_FAILURE';
export const SET_REDIRECT_URL = 'SET_REDIRECT_URL';
export const USER_LOGOUT = 'USER_LOGOUT';

export function setRedirectUrl(payload) {
    return {
        type: SET_REDIRECT_URL,
        payload
    }
} 

export function authenticateUserStart() {
    return {
        type: AUTHENTICATE_USER_START
    }
}

export function authenticateUserSuccess(payload) {
    return {
        type: AUTHENTICATE_USER_SUCCESS,
        payload
    };
}

export function authenticateUserFailure(payload) {
    return {
        type: AUTHENTICATE_USER_FAILURE,
        payload
    };
}

export function authenticateUser(type, code) {
    return (dispatch, getState, axios) => {
        const state = getState();
        //check if we need a new token or a refresh token
        axios.get(`https://watercooler.work/api/login/${type}?code=${code}`)
        .then(response => {
            dispatch(authenticateUserSuccess({ authKey: response.data.access_token }));
        })
        .catch(error => {
            dispatch(authenticateUserFailure({ error: error.message }));
        });
    }
}

export function userLogout() {
    return {
        type: 'USER_LOGOUT'
    };
}
