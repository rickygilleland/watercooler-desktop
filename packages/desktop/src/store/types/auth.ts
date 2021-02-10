export const REQUEST_LOGIN_CODE_STARTED = "REQUEST_LOGIN_CODE_STARTED";
export const REQUEST_LOGIN_CODE_SUCCESS = "REQUEST_LOGIN_CODE_SUCCESS";
export const REQUEST_LOGIN_CODE_FAILURE = "REQUEST_LOGIN_CODE_FAILURE";
export const AUTHENTICATE_USER_STARTED = "AUTHENTICATE_USER_STARTED";
export const AUTHENTICATE_USER_SUCCESS = "AUTHENTICATE_USER_SUCCESS";
export const AUTHENTICATE_USER_FAILURE = "AUTHENTICATE_USER_FAILURE";
export const SET_REDIRECT_URL = "SET_REDIRECT_URL";
export const USER_LOGOUT = "USER_LOGOUT";

export interface AuthState {
  isLoggedIn: boolean;
  authKey: string | null;
  loginError: boolean;
  codeError: boolean;
  redirectUrl: string;
  loading: boolean;
}

interface RequestLoginCodeStartedAction {
  type: typeof REQUEST_LOGIN_CODE_STARTED;
  payload: AuthState;
}

interface RequestLoginCodeSuccessAction {
  type: typeof REQUEST_LOGIN_CODE_SUCCESS;
  payload: AuthState;
}

interface RequestLoginCodeFailureAction {
  type: typeof REQUEST_LOGIN_CODE_FAILURE;
  payload: AuthState;
}

interface AuthenticateUserStartedAction {
  type: typeof AUTHENTICATE_USER_STARTED;
}

interface AuthenticateUserSuccessAction {
  type: typeof AUTHENTICATE_USER_SUCCESS;
  payload: AuthState;
}

interface AuthenticateUserFailureAction {
  type: typeof AUTHENTICATE_USER_FAILURE;
  payload: AuthState;
}

interface SetRedirectUrlAction {
  type: typeof SET_REDIRECT_URL;
  payload: {
    redirectUrl: string;
  };
}

interface UserLogoutAction {
  type: typeof USER_LOGOUT;
}

export type AuthActionTypes =
  | RequestLoginCodeStartedAction
  | RequestLoginCodeSuccessAction
  | RequestLoginCodeFailureAction
  | AuthenticateUserStartedAction
  | AuthenticateUserSuccessAction
  | AuthenticateUserFailureAction
  | SetRedirectUrlAction
  | UserLogoutAction;
