/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  ADD_NEW_MESSAGE_FROM_NOTIFICATION_SUCCESS,
  CREATE_MESSAGE_FAILURE,
  CREATE_MESSAGE_STARTED,
  CREATE_MESSAGE_SUCCESS,
  GET_MESSAGES_BY_THREAD_ID_FAILURE,
  GET_MESSAGES_BY_THREAD_ID_STARTED,
  GET_MESSAGES_BY_THREAD_ID_SUCCESS,
  Message,
  MessageActionTypes,
} from "../store/types/message";
import { AuthenticatedRequestHeaders, GlobalState } from "../store/types";
import { getThread } from "./thread";

export function createMessageStarted(): MessageActionTypes {
  return {
    type: CREATE_MESSAGE_STARTED,
  };
}

export function createMessageSuccess(payload: Message): MessageActionTypes {
  return {
    type: CREATE_MESSAGE_SUCCESS,
    payload,
  };
}

export function createMessageFailure(): MessageActionTypes {
  return {
    type: CREATE_MESSAGE_FAILURE,
  };
}

export function getMessagesByThreadIdStarted(): MessageActionTypes {
  return {
    type: GET_MESSAGES_BY_THREAD_ID_STARTED,
  };
}

export function getMessagesByThreadIdSuccess(
  payload: Message[],
): MessageActionTypes {
  return {
    type: GET_MESSAGES_BY_THREAD_ID_SUCCESS,
    payload,
  };
}

export function getMessagesByThreadIdFailure(): MessageActionTypes {
  return {
    type: GET_MESSAGES_BY_THREAD_ID_FAILURE,
  };
}

export function addNewMessageFromNotificationSuccess(
  payload: Message,
): MessageActionTypes {
  return {
    type: ADD_NEW_MESSAGE_FROM_NOTIFICATION_SUCCESS,
    payload,
  };
}

export function createMessage(message: Partial<Message>) {
  return (
    dispatch: (arg0: unknown) => void,
    getState: () => GlobalState,
    axios: (arg0: {
      method: string;
      url: string;
      data: Partial<Message>;
      headers: AuthenticatedRequestHeaders;
    }) => Promise<{ data: Message }>,
  ) => {
    dispatch(createMessageStarted());
    const state = getState();

    try {
      axios({
        method: "post",
        url: `https://blab.to/api/messages`,
        data: message,
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + state.auth.authKey,
        },
      })
        .then((response: { data: Message }) => {
          if (!state.thread.privateThreads[response.data.thread_id]) {
            dispatch(getThread(response.data.thread_id));
          }
          dispatch(createMessageSuccess(response.data));
        })
        .catch(() => {
          dispatch(createMessageFailure());
        });
    } catch (error) {
      dispatch(createMessageFailure());
    }
  };
}

export function getMessagesByThreadId(threadId: string) {
  return (
    dispatch: (arg0: MessageActionTypes) => void,
    getState: () => GlobalState,
    axios: (arg0: {
      method: string;
      url: string;
      headers: AuthenticatedRequestHeaders;
    }) => Promise<{ data: Message[] }>,
  ) => {
    dispatch(getMessagesByThreadIdStarted());
    const state = getState();

    try {
      axios({
        method: "get",
        url: `https://blab.to/api/threads/${threadId}/messages`,
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + state.auth.authKey,
        },
      })
        .then((response: { data: Message[] }) => {
          dispatch(getMessagesByThreadIdSuccess(response.data));
        })
        .catch(() => {
          dispatch(getMessagesByThreadIdFailure());
        });
    } catch (error) {
      dispatch(getMessagesByThreadIdFailure());
    }
  };
}

export function addNewMessageFromNotification(message: Message) {
  return (dispatch: (arg0: MessageActionTypes) => void) => {
    dispatch(addNewMessageFromNotificationSuccess(message));
  };
}
