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

export interface AuthRequest {
  grant_type: string;
  client_id: number;
  client_secret: string;
  username: string;
  password: string;
  scope: string;
}

interface RequestLoginCodeStartedAction {
  type: typeof REQUEST_LOGIN_CODE_STARTED;
}

interface RequestLoginCodeSuccessAction {
  type: typeof REQUEST_LOGIN_CODE_SUCCESS;
}

interface RequestLoginCodeFailureAction {
  type: typeof REQUEST_LOGIN_CODE_FAILURE;
}

interface AuthenticateUserStartedAction {
  type: typeof AUTHENTICATE_USER_STARTED;
}

interface AuthenticateUserSuccessAction {
  type: typeof AUTHENTICATE_USER_SUCCESS;
  payload: string;
}

interface AuthenticateUserFailureAction {
  type: typeof AUTHENTICATE_USER_FAILURE;
}

interface SetRedirectUrlAction {
  type: typeof SET_REDIRECT_URL;
  payload: string;
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
