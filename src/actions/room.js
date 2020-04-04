export const GET_ROOMS_SUCCESS = 'GET_ROOMS_SUCCESS';
export const GET_ROOMS_FAILURE = 'GET_ROOMS_FAILURE';

export function getRoomsSuccess(payload) {
    return {
        type: GET_ROOMS_SUCCESS,
        payload
    }
} 

export function getRoomsFailure(payload) {
    return {
        type: GET_ROOMS_FAILURE,
        payload
    }
} 

export function getRooms() {
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
            dispatch(getRoomsSuccess({ data: response.data}));
        })
        .catch(error => {
            dispatch(getRoomsFailure({ error: error.message }));
        })
    }
}