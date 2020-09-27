export const GET_ITEMS_STARTED = 'GET_ITEMS_STARTED';
export const GET_ITEMS_SUCCESS = 'GET_ITEMS_SUCCESS';
export const GET_ITEMS_FAILURE = 'GET_ITEMS_FAILURE';
export const CREATE_ITEM_STARTED = 'CREATE_ITEM_STARTED';
export const CREATE_ITEM_SUCCESS = 'CREATE_ITEM_SUCCESS';
export const CREATE_ITEM_FAILURE = 'CREATE_ITEM_FAILURE';
export const ADD_NEW_ITEM_FROM_NOTIFICATION_SUCCESS = 'ADD_NEW_ITEM_FROM_NOTIFICATION_SUCCESS';

export function getItemsStarted() {
    return {
        type: GET_ITEMS_STARTED
    }
} 

export function getItemsSuccess(payload) {
    return {
        type: GET_ITEMS_SUCCESS,
        payload
    }
} 

export function getItemsFailure(payload) {
    return {
        type: GET_ITEMS_FAILURE,
        payload
    }
} 

export function createItemStarted() {
    return {
        type: CREATE_ITEM_STARTED
    }
} 

export function createItemSuccess(payload) {
    return {
        type: CREATE_ITEM_SUCCESS,
        payload
    }
} 

export function createItemFailure(payload) {
    return {
        type: CREATE_ITEM_FAILURE,
        payload
    }
} 

export function addNewItemFromNotificationSuccess(payload) {
    return {
        type: ADD_NEW_ITEM_FROM_NOTIFICATION_SUCCESS,
        payload
    }
}

export function getLibraryItems() {
    return (dispatch, getState, axios) => {
        dispatch(getItemsStarted());
        const state = getState();

        try {
            axios({
                method: 'get',
                url: `https://blab.to/api/library/items`,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+state.auth.authKey,
                }
            })
            .then(response => {
                dispatch(getItemsSuccess({ data: response.data}));
            })
            .catch(error => {
                dispatch(getItemsFailure({ error: error.message }));
            })
        } catch (error) {
            dispatch(getItemsFailure({ error: error }));
        }
    }
}

export function createItem(item) {
    return (dispatch, getState, axios) => {
        dispatch(createItemStarted());
        const state = getState();

        try {
            axios({
                method: 'post',
                url: `https://blab.to/api/library/items`,
                data: item,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+state.auth.authKey,
                }
            })
            .then(response => {
                dispatch(createItemSuccess({ data: response.data}));
            })
            .catch(error => {
                dispatch(createItemFailure({ error: error.message }));
            })
        } catch (error) {
            dispatch(createItemFailure({ error: error }));
        }
    }
}

export function addNewItemFromNotification(item) {
    return (dispatch) => {
        dispatch(addNewItemFromNotificationSuccess({ data: item }));
    }
}