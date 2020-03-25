export const GET_ROOMS_SUCCESS = 'GET_ROOMS_SUCCESS';
export const GET_ROOMS_FAILURE = 'GET_ROOMS_FAILURE';

export function getRoomsSuccess(response) {
    return {
        type: GET_ROOMS_SUCCESS,
        response
    }
} 

export function getRoomsFailure() {
    return {
        type: GET_ROOMS_FAILURE
    }
} 

export function getRooms() {
    return (dispatch, getState, axios) => {
        const state = getState();
        //check if we need to do some state stuff

        axios.get("https://w.test/api/organization", {
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+state.auth.authKey,
            }
        })
        .then(response => {
            dispatch(getRoomsSuccess(response.data));
        })
        .catch(error => {
            dispatch(getRoomsFailure(error.message));
        })
    }
}