export const GET_USER_DETAILS_SUCCESS = 'GET_USER_DETAILS_SUCCESS';
export const GET_USER_DETAILS_FAILURE = 'GET_USER_DETAILS_FAILURE';

export function getUserDetailsSuccess(response) {
    return {
        type: GET_USER_DETAILS_SUCCESS,
        response
    };
}

export function getUserDetailsFailure(error) {
    return {
        type: GET_USER_DETAILS_FAILURE
    };
}

export function getUserDetails() {
    return (dispatch, getState, axios) => {
        const state = getState();
        //check if we need to do some state stuff

        axios.get("https://w.test/api/user", {
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+state.auth.authKey,
            }
        })
        .then(response => {
            dispatch(getUserDetailsSuccess(response.data));
        })
        .catch(error => {
            dispatch(getUserDetailsFailure(error.message));
        })
    }
}