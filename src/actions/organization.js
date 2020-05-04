export const GET_ORGANIZATIONS_SUCCESS = 'GET_ROOMS_SUCCESS';
export const GET_ORGANIZATIONS_FAILURE = 'GET_ROOMS_FAILURE';
export const GET_ORGANIZATION_USERS_STARTED = 'GET_ORGANIZATION_USERS_STARTED';
export const GET_ORGANIZATION_USERS_SUCCESS = 'GET_ORGANIZATION_USERS_SUCCESS';
export const GET_ORGANIZATION_USERS_FAILURE = 'GET_ORGANIZATION_USERS_FAILURE';
export const INVITE_USERS_STARTED = 'INVITE_USERS_STARTED';
export const INVITE_USERS_SUCCESS = 'INVITE_USERS_SUCCESS';
export const INVITE_USERS_FAILURE = 'INVITE_USERS_FAILURE';
export const CREATE_ROOM_STARTED = 'CREATE_ROOM_STARTED';
export const CREATE_ROOM_SUCCESS = 'CREATE_ROOM_SUCCESS';
export const CREATE_ROOM_FAILURE = 'CREATE_ROOM_FAILURE';

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

export function createRoomStarted() {
    return {
        type: CREATE_ROOM_STARTED
    }
}

export function createRoomSuccess(payload) {
    return {
        type: CREATE_ROOM_SUCCESS,
        payload
    }
}

export function createRoomFailure(payload) {
    return {
        type: CREATE_ROOM_FAILURE,
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

export function createRoom(name, videoEnabled, isPrivate) {
    return (dispatch, getState, axios) => {
        dispatch(createRoomStarted());
        const state = getState();

        axios({
            method: 'post',
            url: `https://watercooler.work/api/room`,
            data: { 
                name: name,
                video_enabled: videoEnabled,
                is_private: isPrivate,
                organization_id: state.organization.organization.id,
                team_id: state.organization.teams[0].id
            },
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+state.auth.authKey,
            }
        })
        .then(response => {
            dispatch(createRoomSuccess({ data: response.data}));
        })
        .catch(error => {
            dispatch(createRoomFailure({ error: error.message }));
        })
    }
}
