import {
  GET_USER_DETAILS_FAILURE,
  GET_USER_DETAILS_SUCCESS,
  UPDATE_USER_DETAILS_FAILURE,
  UPDATE_USER_DETAILS_STARTED,
  UPDATE_USER_DETAILS_SUCCESS,
  User,
  UserActionTypes,
} from "../store/types/user";

const initialState = {} as User;

export default function user(
  state = initialState,
  action: UserActionTypes,
): User {
  let updatedState = {};
  switch (action.type) {
    case GET_USER_DETAILS_SUCCESS:
      updatedState = action.payload;
      break;
    case GET_USER_DETAILS_FAILURE:
      return state;
    case UPDATE_USER_DETAILS_STARTED:
      return state;
    case UPDATE_USER_DETAILS_SUCCESS:
      updatedState = action.payload;
      break;
    case UPDATE_USER_DETAILS_FAILURE:
      return state;
    default:
      //do nothing
      return state;
  }
  const newState = Object.assign({}, state, { ...state, ...updatedState });
  return newState;
}
