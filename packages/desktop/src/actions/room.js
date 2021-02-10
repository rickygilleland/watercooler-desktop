export const GET_ROOMS_SUCCESS = "GET_ROOMS_SUCCESS";
export const GET_ROOMS_FAILURE = "GET_ROOMS_FAILURE";
export const GET_ROOM_USERS_STARTED = "GET_ROOM_USERS_STARTED";
export const GET_ROOM_USERS_SUCCESS = "GET_ROOM_USERS_SUCCESS";
export const GET_ROOM_USERS_FAILURE = "GET_ROOM_USERS_FAILURE";
export const ADD_USER_TO_ROOM_STARTED = "ADD_USER_TO_ROOM_STARTED";
export const ADD_USER_TO_ROOM_SUCCESS = "ADD_USER_TO_ROOM_SUCCESS";
export const ADD_USER_TO_ROOM_FAILURE = "ADD_USER_TO_ROOM_FAILURE";

export function getRoomsSuccess(payload) {
  return {
    type: GET_ROOMS_SUCCESS,
    payload,
  };
}

export function getRoomsFailure(payload) {
  return {
    type: GET_ROOMS_FAILURE,
    payload,
  };
}

export function getRoomUsersStarted() {
  return {
    type: GET_ROOM_USERS_STARTED,
  };
}

export function getRoomUsersSuccess(payload) {
  return {
    type: GET_ROOM_USERS_SUCCESS,
    payload,
  };
}

export function getRoomUsersFailure(payload) {
  return {
    type: GET_ROOM_USERS_FAILURE,
    payload,
  };
}

export function addUserToRoomStarted() {
  return {
    type: ADD_USER_TO_ROOM_STARTED,
  };
}

export function addUserToRoomSuccess(payload) {
  return {
    type: ADD_USER_TO_ROOM_SUCCESS,
    payload,
  };
}

export function addUserToRoomFailure(payload) {
  return {
    type: ADD_USER_TO_ROOM_FAILURE,
    payload,
  };
}

export function getRooms() {
  return (dispatch, getState, axios) => {
    const state = getState();
    //check if we need to do some state stuff

    try {
      axios
        .get("https://blab.to/api/organization", {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + state.auth.authKey,
          },
        })
        .then((response) => {
          dispatch(getRoomsSuccess({ data: response.data }));
        })
        .catch((error) => {
          dispatch(getRoomsFailure({ error: error.message }));
        });
    } catch (error) {
      dispatch(getRoomsFailure({ error: error }));
    }
  };
}

export function getRoomUsers(roomId) {
  return (dispatch, getState, axios) => {
    const state = getState();
    dispatch(getRoomUsersStarted());

    try {
      axios
        .get(`https://blab.to/api/room/${roomId}/users`, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + state.auth.authKey,
          },
        })
        .then((response) => {
          dispatch(getRoomUsersSuccess({ data: response.data }));
        })
        .catch((error) => {
          dispatch(getRoomUsersFailure({ error: error.message }));
        });
    } catch (error) {
      dispatch(getRoomUsersFailure({ error: error }));
    }
  };
}

export function addUserToRoom(roomId, userId) {
  return (dispatch, getState, axios) => {
    dispatch(addUserToRoomStarted());
    const state = getState();

    try {
      axios({
        method: "post",
        url: `https://blab.to/api/room/${roomId}/users`,
        data: {
          user_id: userId,
        },
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + state.auth.authKey,
        },
      })
        .then((response) => {
          dispatch(addUserToRoomSuccess({ data: response.data }));
        })
        .catch((error) => {
          dispatch(addUserToRoomFailure({ error: error.message }));
        });
    } catch (error) {
      dispatch(addUserToRoomFailure({ error: error }));
    }
  };
}
