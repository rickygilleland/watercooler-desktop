export const GET_USER_DETAILS_SUCCESS = 'GET_USER_DETAILS_SUCCESS';
export const GET_USER_DETAILS_FAILURE = 'GET_USER_DETAILS_FAILURE';
export const UPDATE_USER_DETAILS_STARTED = 'UPDATE_USER_DETAILS_START';
export const UPDATE_USER_DETAILS_SUCCESS = 'UPDATE_USER_DETAILS_SUCCESS';
export const UPDATE_USER_DETAILS_FAILURE = 'UPDATE_USER_DETAILS_FAILURE';

export function getUserDetailsSuccess(payload) {
    return {
        type: GET_USER_DETAILS_SUCCESS,
        payload
    };
}

export function getUserDetailsFailure(payload) {
    return {
        type: GET_USER_DETAILS_FAILURE,
        payload
    };
}

export function updateUserDetailsStarted() {
    return {
        type: UPDATE_USER_DETAILS_STARTED
    };
}

export function updateUserDetailsSuccess(payload) {
    return {
        type: UPDATE_USER_DETAILS_SUCCESS,
        payload
    };
}

export function updateUserDetailsFailure(payload) {
    return {
        type: UPDATE_USER_DETAILS_FAILURE,
        payload
    };
}

export function getUserDetails() {
    return (dispatch, getState, axios) => {
        const state = getState();
        //check if we need to do some state stuff

        try {
            axios.get("https://blab.to/api/user", {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+state.auth.authKey,
                }
            })
            .then(response => {
                dispatch(getUserDetailsSuccess({ data: response.data }));
            })
            .catch(error => {
                dispatch(getUserDetailsFailure({ error: error.message }));
            })
        } catch (error) {
            dispatch(getUserDetailsFailure({ error: error }));
        }
    }
}

export function updateUserDetails(timezone) {
    return (dispatch, getState, axios) => {
        const state = getState();
        dispatch(updateUserDetailsStarted());

        try {
            axios({
                method: 'patch',
                url: `https://blab.to/api/user/${state.user.id}`,
                data: { 
                    timezone
                },
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+state.auth.authKey,
                }
            })
            .then(response => {
                dispatch(updateUserDetailsSuccess({ data: response.data}));
            })
            .catch(error => {
                dispatch(updateUserDetailsFailure({ error: error.message }));
            })
        } catch (error) {
            dispatch(updateUserDetailsFailure({ error: error }));
        }

    }
}