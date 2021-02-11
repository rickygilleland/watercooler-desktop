/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  ADD_USER_TO_ROOM_FAILURE,
  ADD_USER_TO_ROOM_STARTED,
  ADD_USER_TO_ROOM_SUCCESS,
  GET_ROOM_USERS_FAILURE,
  GET_ROOM_USERS_STARTED,
  GET_ROOM_USERS_SUCCESS,
  RoomActionTypes,
} from "../store/types/room";
import { GlobalState } from "../store/types";
import { User } from "../store/types/user";

export function getRoomUsersStarted(): RoomActionTypes {
  return {
    type: GET_ROOM_USERS_STARTED,
  };
}

export function getRoomUsersSuccess(payload: User[]): RoomActionTypes {
  return {
    type: GET_ROOM_USERS_SUCCESS,
    payload,
  };
}

export function getRoomUsersFailure(): RoomActionTypes {
  return {
    type: GET_ROOM_USERS_FAILURE,
  };
}

export function addUserToRoomStarted(): RoomActionTypes {
  return {
    type: ADD_USER_TO_ROOM_STARTED,
  };
}

export function addUserToRoomSuccess(): RoomActionTypes {
  return {
    type: ADD_USER_TO_ROOM_SUCCESS,
  };
}

export function addUserToRoomFailure(): RoomActionTypes {
  return {
    type: ADD_USER_TO_ROOM_FAILURE,
  };
}

export function getRoomUsers(roomId: number) {
  return (
    dispatch: (arg0: RoomActionTypes) => void,
    getState: () => GlobalState,
    axios: {
      get: (
        arg0: string,
        arg1: { headers: { Accept: string; Authorization: string } },
      ) => Promise<any>;
    },
  ) => {
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
        .then((response: { data: User[] }) => {
          dispatch(getRoomUsersSuccess(response.data));
        })
        .catch(() => {
          dispatch(getRoomUsersFailure());
        });
    } catch (error) {
      dispatch(getRoomUsersFailure());
    }
  };
}

export function addUserToRoom(roomId: number, userId: number) {
  return (
    dispatch: (arg0: RoomActionTypes) => void,
    getState: () => GlobalState,
    axios: (arg0: {
      method: string;
      url: string;
      data: { user_id: any };
      headers: { Accept: string; Authorization: string };
    }) => Promise<any>,
  ) => {
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
        .then(() => {
          dispatch(addUserToRoomSuccess());
        })
        .catch(() => {
          dispatch(addUserToRoomFailure());
        });
    } catch (error) {
      dispatch(addUserToRoomFailure());
    }
  };
}
