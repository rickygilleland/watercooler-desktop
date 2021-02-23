import {
  ADD_USER_TO_ROOM_FAILURE,
  ADD_USER_TO_ROOM_STARTED,
  ADD_USER_TO_ROOM_SUCCESS,
  GET_ROOM_USERS_FAILURE,
  GET_ROOM_USERS_STARTED,
  GET_ROOM_USERS_SUCCESS,
  RoomActionTypes,
  RoomState,
} from "../store/types/room";

const initialState: RoomState = {
  users: [],
  loading: false,
  addUserLoading: false,
  error: false,
};

export default function room(
  state = initialState,
  action: RoomActionTypes,
): RoomState {
  let updatedState = {};
  switch (action.type) {
    case GET_ROOM_USERS_STARTED:
      updatedState = {
        loading: true,
        error: false,
      };
      break;
    case GET_ROOM_USERS_SUCCESS:
      updatedState = {
        loading: false,
        error: false,
        users: action.payload,
      };
      break;
    case GET_ROOM_USERS_FAILURE:
      updatedState = {
        loading: false,
        error: true,
        users: [],
      };
      break;
    case ADD_USER_TO_ROOM_STARTED:
      updatedState = {
        addUserLoading: true,
        error: false,
      };
      break;
    case ADD_USER_TO_ROOM_SUCCESS:
      updatedState = {
        addUserLoading: false,
        error: false,
      };
      break;
    case ADD_USER_TO_ROOM_FAILURE:
      updatedState = {
        addUserLoading: false,
        error: true,
      };
      break;
    default:
      //do nothing
      return state;
  }
  const newState = Object.assign({}, state, { ...state, ...updatedState });
  return newState;
}
