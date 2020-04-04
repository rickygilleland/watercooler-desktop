export const GET_USER_DETAILS_SUCCESS = 'GET_USER_DETAILS_SUCCESS';
export const GET_USER_DETAILS_FAILURE = 'GET_USER_DETAILS_FAILURE';

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

export function getUserDetails() {
    return (dispatch, getState, axios) => {
        const state = getState();
        //check if we need to do some state stuff

        axios.get("https://watercooler.work/api/user", {
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
    }
}