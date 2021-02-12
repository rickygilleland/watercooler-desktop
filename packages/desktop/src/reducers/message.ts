import {
  ADD_NEW_MESSAGE_FROM_NOTIFICATION_SUCCESS,
  CREATE_MESSAGE_FAILURE,
  CREATE_MESSAGE_STARTED,
  CREATE_MESSAGE_SUCCESS,
  GET_MESSAGES_BY_THREAD_ID_FAILURE,
  GET_MESSAGES_BY_THREAD_ID_STARTED,
  GET_MESSAGES_BY_THREAD_ID_SUCCESS,
  MessageActionTypes,
  MessageState,
} from "../store/types/message";
import { cloneDeep } from "lodash";

const initialState: MessageState = {
  messages: {},
  lastCreatedMessage: null,
  loading: false,
  creating: false,
  error: false,
};

export default function message(
  state = initialState,
  action: MessageActionTypes,
): MessageState {
  let updatedState = {};
  switch (action.type) {
    case CREATE_MESSAGE_STARTED: {
      updatedState = {
        creating: true,
        error: false,
        lastCreatedMessage: null,
      };
      break;
    }
    case CREATE_MESSAGE_SUCCESS: {
      const updatedMessages = cloneDeep(state.messages);

      if (!updatedMessages[action.payload.thread_id]) {
        updatedMessages[action.payload.thread_id] = {};
      }

      updatedMessages[action.payload.thread_id][action.payload.id] =
        action.payload;

      updatedState = {
        messages: updatedMessages,
        creating: false,
        error: false,
        lastCreatedMessage: action.payload,
      };
      break;
    }
    case CREATE_MESSAGE_FAILURE: {
      updatedState = {
        creating: false,
        error: true,
        lastCreatedMessage: null,
      };
      break;
    }
    case GET_MESSAGES_BY_THREAD_ID_STARTED: {
      updatedState = {
        loading: true,
        error: false,
        lastCreatedMessage: null,
      };
      break;
    }
    case GET_MESSAGES_BY_THREAD_ID_SUCCESS: {
      const updatedMessages = cloneDeep(state.messages);

      action.payload.forEach((message) => {
        if (!updatedMessages[message.thread_id]) {
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
    }
    case GET_MESSAGES_BY_THREAD_ID_FAILURE: {
      updatedState = {
        loading: false,
        error: true,
        lastCreatedMessage: null,
      };
      break;
    }
    case ADD_NEW_MESSAGE_FROM_NOTIFICATION_SUCCESS: {
      const updatedMessages = cloneDeep(state.messages);

      updatedMessages[action.payload.thread_id][action.payload.id] =
        action.payload;

      updatedState = {
        messages: updatedMessages,
        loading: false,
        error: true,
        lastCreatedMessage: null,
      };
      break;
    }
    default: {
      //do nothing
      return state;
    }
  }
  const newState = Object.assign({}, state, { ...state, ...updatedState });
  return newState;
}
