export const GET_ORGANIZATIONS_SUCCESS = 'GET_ROOMS_SUCCESS';
export const GET_ORGANIZATIONS_FAILURE = 'GET_ROOMS_FAILURE';

export function getOrganizationsSuccess(payload) {
    return {
        type: GET_ORGANIZATIONS_SUCCESS,
        payload
    }
} 

export function getOrganizationsFailure(payload) {
    return {
        type: GET_ORGANIZATIONS_FAILURE,
        payload
    }
} 

export function getOrganizations() {
    return (dispatch, getState, axios) => {
        const state = getState();
        //check if we need to do some state stuff

        axios.get("https://watercooler.work/api/organization", {
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+state.auth.authKey,
            }
        })
        .then(response => {
            dispatch(getOrganizationsSuccess({ data: response.data}));
        })
        .catch(error => {
            dispatch(getOrganizationsFailure({ error: error.message }));
        })
    }
}