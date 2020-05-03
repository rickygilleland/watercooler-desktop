export const REQUEST_LOGIN_CODE_STARTED = 'REQUEST_LOGIN_CODE_STARTED';
export const REQUEST_LOGIN_CODE_SUCCESS = 'REQUEST_LOGIN_CODE_SUCCESS';
export const REQUEST_LOGIN_CODE_FAILURE = 'REQUEST_LOGIN_CODE_FAILURE';
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

export function requestLoginCodeStarted() {
    return {
        type: REQUEST_LOGIN_CODE_STARTED
    };
}

export function requestLoginCodeSuccess(payload) {
    return {
        type: REQUEST_LOGIN_CODE_SUCCESS,
        payload: payload
    };
}

export function requestLoginCodeFailure(payload) {
    return {
        type: REQUEST_LOGIN_CODE_FAILURE,
        payload: payload
    };
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

export function requestLoginCode(email) {
    return (dispatch, getState, axios) => {
        dispatch(requestLoginCodeStarted());

        const state = getState();
        //check if we need a new token or a refresh token
        axios.post(`https://watercooler.work/api/login_code`, {
            email: email
        })
        .then(response => {
            dispatch(requestLoginCodeSuccess({ authKey: response.data.access_token }));
        })
        .catch(error => {
            dispatch(requestLoginCodeFailure({ error: error.message }));
        });
    }
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

export function authenticateUserMagicLink(code) {
    return (dispatch, getState, axios) => {
        dispatch(authenticateUserStarted());

        const state = getState();
        //check if we need a new token or a refresh token
        axios.post(`https://watercooler.work/api/magic/auth`, {
            code: code
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
