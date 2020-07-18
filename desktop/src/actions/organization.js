export const GET_ORGANIZATIONS_SUCCESS = 'GET_ORGANIZATIONS_SUCCESS';
export const GET_ORGANIZATIONS_FAILURE = 'GET_ORGANIZATIONS_FAILURE';
export const GET_ORGANIZATION_USERS_STARTED = 'GET_ORGANIZATION_USERS_STARTED';
export const GET_ORGANIZATION_USERS_SUCCESS = 'GET_ORGANIZATION_USERS_SUCCESS';
export const GET_ORGANIZATION_USERS_FAILURE = 'GET_ORGANIZATION_USERS_FAILURE';
export const INVITE_USERS_STARTED = 'INVITE_USERS_STARTED';
export const INVITE_USERS_SUCCESS = 'INVITE_USERS_SUCCESS';
export const INVITE_USERS_FAILURE = 'INVITE_USERS_FAILURE';
export const CREATE_ROOM_STARTED = 'CREATE_ROOM_STARTED';
export const CREATE_ROOM_SUCCESS = 'CREATE_ROOM_SUCCESS';
export const CREATE_ROOM_FAILURE = 'CREATE_ROOM_FAILURE';
export const CREATE_CALL_STARTED = 'CREATE_CALL_STARTED';
export const CREATE_CALL_SUCCESS = 'CREATE_CALL_SUCCESS';
export const CREATE_CALL_FAILURE = 'CREATE_CALL_FAILURE';

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

export function createCallStarted() {
    return {
        type: CREATE_CALL_STARTED
    }
}

export function createCallSuccess(payload) {
    return {
        type: CREATE_CALL_SUCCESS,
        payload
    }
}

export function createCallFailure(payload) {
    return {
        type: CREATE_CALL_FAILURE,
        payload
    }
}

export function getOrganizations() {
    return (dispatch, getState, axios) => {
        const state = getState();
        //check if we need to do some state stuff

        try {
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
        } catch (error) {
            dispatch(getOrganizationsFailure({ error: error }));
        }
    }
}

export function getOrganizationUsers(organization_id) {
    return (dispatch, getState, axios) => {
        dispatch(getOrganizationUsersStarted());
        const state = getState();
        //check if we need to do some state stuff

        try {
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
        } catch (error) {
            dispatch(getOrganizationUsersFailure({ error: error }));
        }
    }
}

export function inviteUsers(emails) {
    return (dispatch, getState, axios) => {
        dispatch(inviteUsersStarted());
        const state = getState();

        const organization_id = state.organization.organization.id;
  
        try {
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
        } catch (error) {
            dispatch(inviteUsersFailure({ error: error }));
        }
    }
}

export function createRoom(name, videoEnabled, isPrivate) {
    return (dispatch, getState, axios) => {
        dispatch(createRoomStarted());
        const state = getState();

        try {
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
        } catch (error) {
            dispatch(createRoomFailure({ error: error }));
        }
    }
}

export function createCall(participants) {
    return (dispatch, getState, axios) => {
        dispatch(createCallStarted());
        const state = getState();

        try {
            axios({
                method: 'post',
                url: `https://watercooler.work/api/call`,
                data: { 
                    organization_id: state.organization.organization.id,
                    team_id: state.organization.teams[0].id,
                    participants,
                    type: "call"
                },
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer '+state.auth.authKey,
                }
            })
            .then(response => {
                dispatch(createCallSuccess({ data: response.data}));
            })
            .catch(error => {
                dispatch(createCallFailure({ error: error.message }));
            })
        } catch (error) {
            dispatch(createCallFailure({ error: error }));
        }
    }
}
