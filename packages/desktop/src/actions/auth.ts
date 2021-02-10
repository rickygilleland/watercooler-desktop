import {
  AuthState,
  REQUEST_LOGIN_CODE_STARTED,
  REQUEST_LOGIN_CODE_SUCCESS,
  REQUEST_LOGIN_CODE_FAILURE,
  AUTHENTICATE_USER_STARTED,
  AUTHENTICATE_USER_SUCCESS,
  AUTHENTICATE_USER_FAILURE,
  SET_REDIRECT_URL,
  USER_LOGOUT,
  AuthActionTypes,
} from "../store/types/auth";

export function setRedirectUrl(payload: {
  redirectUrl: AuthState["redirectUrl"];
}): AuthActionTypes {
  return {
    type: SET_REDIRECT_URL,
    payload,
  };
}

export function requestLoginCodeStarted(payload: AuthState): AuthActionTypes {
  return {
    type: REQUEST_LOGIN_CODE_STARTED,
    payload,
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

export function authenticateUserFailure(payload: AuthState): AuthActionTypes {
  return {
    type: AUTHENTICATE_USER_FAILURE,
    payload,
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
            requestLoginCodeSuccess({ authKey: response.data.access_token }),
          );
        })
        .catch((error: { message: any }) => {
          dispatch(requestLoginCodeFailure({ error: error.message }));
        });
    } catch (error) {
      dispatch(requestLoginCodeFailure({ error: error }));
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
            authenticateUserSuccess({ authKey: response.data.access_token }),
          );
        })
        .catch((error: { message: any }) => {
          dispatch(authenticateUserFailure({ error: error.message }));
        });
    } catch (error) {
      dispatch(authenticateUserFailure({ error: error }));
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
            authenticateUserSuccess({ authKey: response.data.access_token }),
          );
        })
        .catch((error: { message: any }) => {
          dispatch(authenticateUserFailure({ error: error.message }));
        });
    } catch (error) {
      dispatch(authenticateUserFailure({ error: error }));
    }
  };
}

export function userLogout() {
  return {
    type: USER_LOGOUT,
  };
}
