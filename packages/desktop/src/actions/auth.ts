/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  AUTHENTICATE_USER_FAILURE,
  AUTHENTICATE_USER_STARTED,
  AUTHENTICATE_USER_SUCCESS,
  AuthActionTypes,
  AuthRequest,
  REQUEST_LOGIN_CODE_FAILURE,
  REQUEST_LOGIN_CODE_STARTED,
  REQUEST_LOGIN_CODE_SUCCESS,
  SET_REDIRECT_URL,
  USER_LOGOUT,
} from "../store/types/auth";
import { AxiosStatic } from "axios";
import { GlobalState } from "../store/types";

export function setRedirectUrl(payload: string): AuthActionTypes {
  return {
    type: SET_REDIRECT_URL,
    payload,
  };
}

export function requestLoginCodeStarted(): AuthActionTypes {
  return {
    type: REQUEST_LOGIN_CODE_STARTED,
  };
}

export function requestLoginCodeSuccess(): AuthActionTypes {
  return {
    type: REQUEST_LOGIN_CODE_SUCCESS,
  };
}

export function requestLoginCodeFailure(): AuthActionTypes {
  return {
    type: REQUEST_LOGIN_CODE_FAILURE,
  };
}

export function authenticateUserStarted(): AuthActionTypes {
  return {
    type: AUTHENTICATE_USER_STARTED,
  };
}

export function authenticateUserSuccess(payload: string): AuthActionTypes {
  return {
    type: AUTHENTICATE_USER_SUCCESS,
    payload,
  };
}

export function authenticateUserFailure(): AuthActionTypes {
  return {
    type: AUTHENTICATE_USER_FAILURE,
  };
}

export function requestLoginCode(email: string) {
  return (
    dispatch: (arg0: AuthActionTypes) => void,
    getState: () => GlobalState,
    axios: AxiosStatic,
  ) => {
    dispatch(requestLoginCodeStarted());

    try {
      axios
        .post(`https://blab.to/api/login_code`, {
          email: email,
        })
        .then(() => {
          dispatch(requestLoginCodeSuccess());
        })
        .catch(() => {
          dispatch(requestLoginCodeFailure());
        });
    } catch (error) {
      dispatch(requestLoginCodeFailure());
    }
  };
}

export function authenticateUser(email: string, password: string) {
  return (
    dispatch: (arg0: AuthActionTypes) => void,
    getState: () => GlobalState,
    axios: AxiosStatic,
  ) => {
    dispatch(authenticateUserStarted());

    try {
      axios
        .post(`https://blab.to/oauth/token`, {
          grant_type: "password",
          client_id: 4,
          client_secret: "Ke51h8Du4QGaab56E4RNTWAuOkZ6sdKpHwTcLtH5",
          username: email,
          password: password,
          scope: "",
        })
        .then((response: { data: { access_token: string } }) => {
          dispatch(authenticateUserSuccess(response.data.access_token));
        })
        .catch(() => {
          dispatch(authenticateUserFailure());
        });
    } catch (error) {
      dispatch(authenticateUserFailure());
    }
  };
}

export function authenticateUserMagicLink(code: string) {
  return (
    dispatch: (arg0: AuthActionTypes) => void,
    getState: () => GlobalState,
    axios: AxiosStatic,
  ) => {
    dispatch(authenticateUserStarted());

    try {
      axios
        .post(`https://blab.to/api/magic/auth`, {
          code: code,
        })
        .then((response: { data: { access_token: string } }) => {
          dispatch(authenticateUserSuccess(response.data.access_token));
        })
        .catch(() => {
          dispatch(authenticateUserFailure());
        });
    } catch (error) {
      dispatch(authenticateUserFailure());
    }
  };
}

export function userLogout() {
  return {
    type: USER_LOGOUT,
  };
}
