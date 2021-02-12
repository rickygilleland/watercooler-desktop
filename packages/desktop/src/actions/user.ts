/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { AuthenticatedRequestHeaders, GlobalState } from "../store/types/index";
import {
  GET_USER_DETAILS_FAILURE,
  GET_USER_DETAILS_SUCCESS,
  UPDATE_USER_DETAILS_FAILURE,
  UPDATE_USER_DETAILS_STARTED,
  UPDATE_USER_DETAILS_SUCCESS,
  User,
  UserActionTypes,
} from "../store/types/user";

export function getUserDetailsSuccess(payload: User): UserActionTypes {
  return {
    type: GET_USER_DETAILS_SUCCESS,
    payload,
  };
}

export function getUserDetailsFailure(): UserActionTypes {
  return {
    type: GET_USER_DETAILS_FAILURE,
  };
}

export function updateUserDetailsStarted(): UserActionTypes {
  return {
    type: UPDATE_USER_DETAILS_STARTED,
  };
}

export function updateUserDetailsSuccess(payload: User): UserActionTypes {
  return {
    type: UPDATE_USER_DETAILS_SUCCESS,
    payload,
  };
}

export function updateUserDetailsFailure(): UserActionTypes {
  return {
    type: UPDATE_USER_DETAILS_FAILURE,
  };
}

export function getUserDetails() {
  return (
    dispatch: (arg0: UserActionTypes) => void,
    getState: () => GlobalState,
    axios: {
      get: (
        arg0: string,
        arg1: { headers: AuthenticatedRequestHeaders },
      ) => Promise<{ data: User }>;
    },
  ) => {
    const state = getState();

    try {
      axios
        .get("https://blab.to/api/user", {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + state.auth.authKey,
          },
        })
        .then((response: { data: User }) => {
          dispatch(getUserDetailsSuccess(response.data));
        })
        .catch(() => {
          dispatch(getUserDetailsFailure());
        });
    } catch (error) {
      dispatch(getUserDetailsFailure());
    }
  };
}

export function updateUserDetails(timezone: string) {
  return (
    dispatch: (arg0: UserActionTypes) => void,
    getState: () => GlobalState,
    axios: (arg0: {
      method: string;
      url: string;
      data: { timezone: string };
      headers: AuthenticatedRequestHeaders;
    }) => Promise<{ data: User }>,
  ) => {
    const state = getState();
    dispatch(updateUserDetailsStarted());

    try {
      axios({
        method: "patch",
        url: `https://blab.to/api/user/${state.user.id}`,
        data: {
          timezone,
        },
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + state.auth.authKey,
        },
      })
        .then((response: { data: User }) => {
          dispatch(updateUserDetailsSuccess(response.data));
        })
        .catch(() => {
          dispatch(updateUserDetailsFailure());
        });
    } catch (error) {
      dispatch(updateUserDetailsFailure());
    }
  };
}
