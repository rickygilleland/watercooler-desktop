export const GET_USER = 'GET_USER';
export const AUTHENTICATE_USER_SUCCESS = 'AUTHENTICATE_USER_SUCCESS';
export const AUTHENTICATE_USER_FAILURE = 'AUTHENTICATE_USER_FAILURE';
export const SET_REDIRECT_URL = 'SET_REDIRECT_URL';

export function setRedirectUrl(redirectUrl) {
    return {
        type: SET_REDIRECT_URL,
        redirectUrl
    }
} 

export function get_user() {
    return {
        type: GET_USER
    };
}

export function authenticateUserSuccess(authKey, refreshKey) {
    return {
        type: AUTHENTICATE_USER_SUCCESS,
        authKey,
        refreshKey
    };
}

export function authenticateUserFailure(error) {
    return {
        type: AUTHENTICATE_USER_FAILURE
    };
}

export function authenticateUser(username, password) {
    return (dispatch, getState, axios) => {
        const state = getState();
        //check if we need a new token or a refresh token

        axios.post("https://w.test/oauth/token", {
            grant_type: 'password',
            client_id: '4',
            client_secret: 'RcTyBYZBfL5s1og0tLTi8cNUFmN9tgSU7wHkUCXX',
            username: username,
            password: password,
            scope: ''
        })
        .then(response => {
            dispatch(authenticateUserSuccess(response.data.access_token, response.data.refresh_token));
        })
        .catch(error => {
            dispatch(authenticateUserFailure(error.message));
        })
    }
}
