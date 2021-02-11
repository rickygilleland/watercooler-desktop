/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  AUTHENTICATE_USER_FAILURE,
  AUTHENTICATE_USER_STARTED,
  AUTHENTICATE_USER_SUCCESS,
  AuthActionTypes,
  AuthState,
  REQUEST_LOGIN_CODE_FAILURE,
  REQUEST_LOGIN_CODE_STARTED,
  REQUEST_LOGIN_CODE_SUCCESS,
  SET_REDIRECT_URL,
  USER_LOGOUT,
} from "../store/types/auth";

export function setRedirectUrl(payload: {
  redirectUrl: AuthState["redirectUrl"];
}): AuthActionTypes {
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

export function requestLoginCodeSuccess(payload: AuthState): AuthActionTypes {
  return {
    type: REQUEST_LOGIN_CODE_SUCCESS,
    payload: payload,
  };
}

export function requestLoginCodeFailure(payload: AuthState): AuthActionTypes {
  return {
    type: REQUEST_LOGIN_CODE_FAILURE,
    payload: payload,
  };
}

export function authenticateUserStarted(): AuthActionTypes {
  return {
    type: AUTHENTICATE_USER_STARTED,
  };
}

export function authenticateUserSuccess(payload: AuthState): AuthActionTypes {
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
    getState: () => AuthState,
    axios: { post: (arg0: string, arg1: { email: string }) => Promise<any> },
  ) => {
    dispatch(requestLoginCodeStarted());

    const state = getState();

    try {
      axios
        .post(`https://blab.to/api/login_code`, {
          email: email,
        })
        .then((response: { data: { access_token: any } }) => {
          dispatch(
            requestLoginCodeSuccess({
              ...state,
              authKey: response.data.access_token,
            }),
          );
        })
        .catch((error: { message: any }) => {
          dispatch(
            requestLoginCodeFailure({ ...state, codeError: error.message }),
          );
        });
    } catch (error) {
      dispatch(requestLoginCodeFailure({ ...state, codeError: error }));
    }
  };
}

export function authenticateUser(email: string, password: string) {
  return (
    dispatch: (arg0: AuthActionTypes) => void,
    getState: () => AuthState,
    axios: {
      post: (
        arg0: string,
        arg1: {
          grant_type: string;
          client_id: number;
          client_secret: string;
          username: string;
          password: string;
          scope: string;
        },
      ) => Promise<any>;
    },
  ) => {
    dispatch(authenticateUserStarted());

    const state: AuthState = getState();
    try {
      axios
        .post(`https://blab.to/oauth/token`, {
          grant_type: "password",
          client_id: 2,
          client_secret: "c1bE8I6EMEG8TEHt9PTsLaJwvoyo8L8LtNP25mIv",
          username: email,
          password: password,
          scope: "",
        })
        .then((response: { data: { access_token: any } }) => {
          dispatch(
            authenticateUserSuccess({
              ...state,
              authKey: response.data.access_token,
            }),
          );
        })
        .catch(() => {
          dispatch(authenticateUserFailure());
        });
    } catch (error) {
      dispatch(authenticateUserFailure());
    }
  };
}

export function authenticateUserMagicLink(code: any) {
  return (
    dispatch: (arg0: AuthActionTypes) => void,
    getState: () => any,
    axios: { post: (arg0: string, arg1: { code: any }) => Promise<any> },
  ) => {
    dispatch(authenticateUserStarted());

    const state = getState();

    try {
      axios
        .post(`https://blab.to/api/magic/auth`, {
          code: code,
        })
        .then((response: { data: { access_token: any } }) => {
          dispatch(
            authenticateUserSuccess({
              ...state,
              authKey: response.data.access_token,
            }),
          );
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
