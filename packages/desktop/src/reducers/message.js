import {
  ADD_NEW_MESSAGE_FROM_NOTIFICATION_SUCCESS,
  CREATE_MESSAGE_FAILURE,
  CREATE_MESSAGE_STARTED,
  CREATE_MESSAGE_SUCCESS,
  GET_MESSAGES_BY_THREAD_ID_FAILURE,
  GET_MESSAGES_BY_THREAD_ID_STARTED,
  GET_MESSAGES_BY_THREAD_ID_SUCCESS,
} from "../actions/message";
import { Action } from "redux";
import { cloneDeep, orderBy } from "lodash";

const initialState = {
  messages: {},
  lastCreatedMessage: null,
  loading: false,
  creating: false,
  error: false,
};

export default function message(state = initialState, action = {}) {
  var updatedState = {};
  switch (action.type) {
    case CREATE_MESSAGE_STARTED:
      updatedState = {
        creating: true,
        error: false,
        lastCreatedMessage: null,
      };
      break;
    case CREATE_MESSAGE_SUCCESS:
      var updatedMessages = cloneDeep(state.messages);

      if (
        typeof updatedMessages[action.payload.data.thread_id] == "undefined"
      ) {
        updatedMessages[action.payload.data.thread_id] = {};
      }

      updatedMessages[action.payload.data.thread_id][action.payload.data.id] =
        action.payload.data;

      updatedState = {
        messages: updatedMessages,
        creating: false,
        error: false,
        lastCreatedMessage: action.payload.data,
      };
      break;
    case CREATE_MESSAGE_FAILURE:
      updatedState = {
        creating: false,
        error: true,
        lastCreatedMessage: null,
      };
      break;
    case GET_MESSAGES_BY_THREAD_ID_STARTED:
      updatedState = {
        loading: true,
        error: false,
        lastCreatedMessage: null,
      };
      break;
    case GET_MESSAGES_BY_THREAD_ID_SUCCESS:
      var updatedMessages = cloneDeep(state.messages);

      action.payload.data.forEach((message) => {
        if (typeof updatedMessages[message.thread_id] == "undefined") {
          updatedMessages[message.thread_id] = {};
        }
        updatedMessages[message.thread_id][message.id] = message;
      });

      updatedState = {
        messages: updatedMessages,
        loading: false,
        error: false,
      };
      break;
    case GET_MESSAGES_BY_THREAD_ID_FAILURE:
      updatedState = {
        loading: false,
        error: true,
        lastCreatedMessage: null,
      };
      break;
    case ADD_NEW_MESSAGE_FROM_NOTIFICATION_SUCCESS:
      var updatedMessages = cloneDeep(state.messages);

      updatedMessages[action.payload.data.thread_id][action.payload.data.id] =
        action.payload.data;

      updatedState = {
        messages: updatedMessages,
        loading: false,
        error: true,
        lastCreatedMessage: null,
      };
      break;
    default:
      //do nothing
      return state;
  }
  const newState = Object.assign({}, state, { ...state, ...updatedState });
  return newState;
}
