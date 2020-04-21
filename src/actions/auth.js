export const AUTHENTICATE_USER_STARTED = 'AUTHENTICATE_USER_STARTED';
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

export function authenticateUserStarted() {
    return {
        type: AUTHENTICATE_USER_STARTED
    };
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

export function authenticateUser(email, password) {
    return (dispatch, getState, axios) => {
        dispatch(authenticateUserStarted());

        const state = getState();
        //check if we need a new token or a refresh token
        axios.post(`https://watercooler.work/oauth/token`, {
            grant_type: "password",
            client_id: 2,
            client_secret: "c1bE8I6EMEG8TEHt9PTsLaJwvoyo8L8LtNP25mIv",
            username: email,
            password: password,
            scope: ""
        })
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
