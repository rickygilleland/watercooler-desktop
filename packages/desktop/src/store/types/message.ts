import { LibraryItem } from "./library";

export const CREATE_MESSAGE_STARTED = "CREATE_MESSAGE_STARTED";
export const CREATE_MESSAGE_SUCCESS = "CREATE_MESSAGE_SUCCESS";
export const CREATE_MESSAGE_FAILURE = "CREATE_MESSAGE_FAILURE";
export const GET_MESSAGES_BY_THREAD_ID_STARTED =
  "GET_MESSAGES_BY_THREAD_ID_STARTED";
export const GET_MESSAGES_BY_THREAD_ID_SUCCESS =
  "GET_MESSAGES_BY_THREAD_ID_SUCCESS";
export const GET_MESSAGES_BY_THREAD_ID_FAILURE =
  "GET_MESSAGES_BY_THREAD_ID_FAILURE";
export const ADD_NEW_MESSAGE_FROM_NOTIFICATION_SUCCESS =
  "ADD_NEW_MESSAGE_FROM_NOTIFICATION_SUCCESS";

export interface Message extends LibraryItem {
  thread_id: number;
}

export interface MessageGroup {
  [threadId: number]: {
    [messageId: number]: Message;
  };
}

export interface MessageState {
  messages: MessageGroup;
  lastCreatedMessage: Message;
  loading: boolean;
  creating: boolean;
  error: boolean;
}

interface CreateMessageStartedAction {
  type: typeof CREATE_MESSAGE_STARTED;
}

interface CreateMessageSuccessAction {
  type: typeof CREATE_MESSAGE_SUCCESS;
  payload: Message;
}

interface CreateMessageFailureAction {
  type: typeof CREATE_MESSAGE_FAILURE;
}

interface GetMessagesByThreadIdStartedAction {
  type: typeof GET_MESSAGES_BY_THREAD_ID_STARTED;
}

interface GetMessagesByThreadIdSuccessAction {
  type: typeof GET_MESSAGES_BY_THREAD_ID_SUCCESS;
  payload: Message[];
}

interface GetMessagesByThreadIdFailureAction {
  type: typeof GET_MESSAGES_BY_THREAD_ID_FAILURE;
}

interface AddNewMessageFromNotificationSuccessAction {
  type: typeof ADD_NEW_MESSAGE_FROM_NOTIFICATION_SUCCESS;
  payload: Message;
}

export type MessageActionTypes =
  | CreateMessageStartedAction
  | CreateMessageSuccessAction
  | CreateMessageFailureAction
  | GetMessagesByThreadIdStartedAction
  | GetMessagesByThreadIdSuccessAction
  | GetMessagesByThreadIdFailureAction
  | AddNewMessageFromNotificationSuccessAction;
