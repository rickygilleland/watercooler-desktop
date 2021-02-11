import {
  ADD_USER_TO_ROOM_FAILURE,
  ADD_USER_TO_ROOM_STARTED,
  ADD_USER_TO_ROOM_SUCCESS,
  GET_ROOMS_FAILURE,
  GET_ROOMS_SUCCESS,
  GET_ROOM_USERS_FAILURE,
  GET_ROOM_USERS_STARTED,
  GET_ROOM_USERS_SUCCESS,
} from "../actions/room";
import { Action } from "redux";

const initialState = {
  rooms: [],
  users: [],
  curRoom: null,
  loading: false,
  addUserLoading: false,
  error: false,
};

export default function room(state = initialState, action = {}) {
  var updatedState = {};
  switch (action.type) {
    case GET_ROOMS_SUCCESS:
      updatedState = {
        rooms: action.payload.data.teams,
      };
      break;
    case GET_ROOMS_FAILURE:
      updatedState = {
        error: true,
      };
      break;
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
        users: action.payload.data,
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
