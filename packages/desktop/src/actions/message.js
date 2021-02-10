import { getThread } from "./thread";

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

export function createMessageStarted() {
  return {
    type: CREATE_MESSAGE_STARTED,
  };
}

export function createMessageSuccess(payload) {
  return {
    type: CREATE_MESSAGE_SUCCESS,
    payload,
  };
}

export function createMessageFailure(payload) {
  return {
    type: CREATE_MESSAGE_FAILURE,
    payload,
  };
}

export function getMessagesByThreadIdStarted() {
  return {
    type: GET_MESSAGES_BY_THREAD_ID_STARTED,
  };
}

export function getMessagesByThreadIdSuccess(payload) {
  return {
    type: GET_MESSAGES_BY_THREAD_ID_SUCCESS,
    payload,
  };
}

export function getMessagesByThreadIdFailure(payload) {
  return {
    type: GET_MESSAGES_BY_THREAD_ID_FAILURE,
    payload,
  };
}

export function addNewMessageFromNotificationSuccess(payload) {
  return {
    type: ADD_NEW_MESSAGE_FROM_NOTIFICATION_SUCCESS,
    payload,
  };
}

export function createMessage(message) {
  return (dispatch, getState, axios) => {
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
        .then((response) => {
          if (
            typeof response.data.thread_id != "undefined" &&
            response.data.thread_id != null
          ) {
            if (
              typeof state.thread.privateThreads[response.data.thread_id] ==
              "undefined"
            ) {
              dispatch(getThread(response.data.thread_id));
            }
          }

          dispatch(createMessageSuccess({ data: response.data }));
        })
        .catch((error) => {
          dispatch(createMessageFailure({ error: error.message }));
        });
    } catch (error) {
      dispatch(createMessageFailure({ error: error }));
    }
  };
}

export function getMessagesByThreadId(threadId) {
  return (dispatch, getState, axios) => {
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
        .then((response) => {
          dispatch(
            getMessagesByThreadIdSuccess({ data: response.data.messages })
          );
        })
        .catch((error) => {
          dispatch(getMessagesByThreadIdFailure({ error: error.message }));
        });
    } catch (error) {
      dispatch(getMessagesByThreadIdFailure({ error: error }));
    }
  };
}

export function addNewMessageFromNotification(message) {
  return (dispatch) => {
    dispatch(addNewMessageFromNotificationSuccess({ data: message }));
  };
}
