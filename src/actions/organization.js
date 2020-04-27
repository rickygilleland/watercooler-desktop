export const GET_ORGANIZATIONS_SUCCESS = 'GET_ROOMS_SUCCESS';
export const GET_ORGANIZATIONS_FAILURE = 'GET_ROOMS_FAILURE';
export const GET_ORGANIZATION_USERS_STARTED = 'GET_ORGANIZATION_USERS_STARTED';
export const GET_ORGANIZATION_USERS_SUCCESS = 'GET_ORGANIZATION_USERS_SUCCESS';
export const GET_ORGANIZATION_USERS_FAILURE = 'GET_ORGANIZATION_USERS_FAILURE';
export const INVITE_USERS_STARTED = 'INVITE_USERS_STARTED';
export const INVITE_USERS_SUCCESS = 'INVITE_USERS_SUCCESS';
export const INVITE_USERS_FAILURE = 'INVITE_USERS_FAILURE';

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

export function getOrganizationUsersStarted() {
    return {
        type: GET_ORGANIZATION_USERS_STARTED
    }
}

export function getOrganizationUsersSuccess(payload) {
    return {
        type: GET_ORGANIZATION_USERS_SUCCESS,
        payload
    }
} 

export function getOrganizationUsersFailure(payload) {
    return {
        type: GET_ORGANIZATION_USERS_FAILURE,
        payload
    }
} 

export function inviteUsersStarted() {
    return {
        type: INVITE_USERS_STARTED
    }
}

export function inviteUsersSuccess(payload) {
    return {
        type: INVITE_USERS_SUCCESS,
        payload
    }
}

export function inviteUsersFailure(payload) {
    return {
        type: INVITE_USERS_FAILURE,
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

export function getOrganizationUsers(organization_id) {
    return (dispatch, getState, axios) => {
        dispatch(getOrganizationUsersStarted());
        const state = getState();
        //check if we need to do some state stuff

        axios.get(`https://watercooler.work/api/organization/${organization_id}/users`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+state.auth.authKey,
            }
        })
        .then(response => {
            dispatch(getOrganizationUsersSuccess({ data: response.data}));
        })
        .catch(error => {
            dispatch(getOrganizationUsersFailure({ error: error.message }));
        })
    }
}

export function inviteUsers(emails) {
    return (dispatch, getState, axios) => {
        dispatch(inviteUsersStarted());
        const state = getState();

        const organization_id = state.organization.organization.id;
  
        axios({
            method: 'post',
            url: `https://watercooler.work/api/organization/${organization_id}/users/invite`,
            data: { emails: emails },
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+state.auth.authKey,
            }
        })
        .then(response => {
            dispatch(inviteUsersSuccess({ data: response.data}));
        })
        .catch(error => {
            dispatch(inviteUsersFailure({ error: error.message }));
        })
    }
}
