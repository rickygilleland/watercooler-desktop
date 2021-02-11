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
} from "../store/types/auth";

const authState: AuthState = {
  isLoggedIn: false,
  authKey: null,
  loginError: false,
  codeError: false,
  redirectUrl: "/",
  loading: false,
};

export default function auth(
  state = authState,
  action: AuthActionTypes,
): AuthState {
  let updatedState = {};
  switch (action.type) {
    case REQUEST_LOGIN_CODE_STARTED:
      updatedState = {
        loginError: false,
        codeError: false,
        isLoggedIn: false,
        loading: true,
      };
      break;
    case REQUEST_LOGIN_CODE_SUCCESS:
      updatedState = {
        loginError: false,
        codeError: false,
        isLoggedIn: false,
        loading: false,
      };
      break;
    case REQUEST_LOGIN_CODE_FAILURE:
      updatedState = {
        loginError: false,
        codeError: true,
        isLoggedIn: false,
        loading: false,
      };
      break;
    case AUTHENTICATE_USER_SUCCESS:
      updatedState = {
        authKey: action.payload.authKey,
        isLoggedIn: true,
        loginError: false,
        loading: false,
      };
      break;
    case AUTHENTICATE_USER_FAILURE:
      updatedState = {
        loginError: true,
        isLoggedIn: false,
        loading: false,
      };
      break;
    case SET_REDIRECT_URL:
      updatedState = {
        redirectUrl: action.payload.redirectUrl,
      };
      break;
    case AUTHENTICATE_USER_STARTED:
      updatedState = {
        loading: true,
        loginError: false,
      };
      break;
    default:
      //do nothing
      return state;
  }

  const newState = Object.assign({}, state, updatedState);
  return newState;
}
