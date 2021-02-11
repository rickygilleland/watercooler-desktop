/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  GET_THREAD_FAILURE,
  GET_THREAD_STARTED,
  GET_THREAD_SUCCESS,
  GET_USER_THREADS_FAILURE,
  GET_USER_THREADS_STARTED,
  GET_USER_THREADS_SUCCESS,
  Thread,
  ThreadActionTypes,
  ThreadResponse,
} from "../store/types/thread";
import { GlobalState } from "../store/types";

export function getThreadStarted(): ThreadActionTypes {
  return {
    type: GET_THREAD_STARTED,
  };
}

export function getThreadSuccess(payload: Thread): ThreadActionTypes {
  return {
    type: GET_THREAD_SUCCESS,
    payload,
  };
}

export function getThreadFailure(): ThreadActionTypes {
  return {
    type: GET_THREAD_FAILURE,
  };
}

export function getUserThreadsStarted(): ThreadActionTypes {
  return {
    type: GET_USER_THREADS_STARTED,
  };
}

export function getUserThreadsSuccess(
  payload: ThreadResponse,
): ThreadActionTypes {
  return {
    type: GET_USER_THREADS_SUCCESS,
    payload,
  };
}

export function getUserThreadsFailure(): ThreadActionTypes {
  return {
    type: GET_USER_THREADS_FAILURE,
  };
}

export function getThread(threadId: number) {
  return (
    dispatch: (arg0: ThreadActionTypes) => void,
    getState: () => GlobalState,
    axios: (arg0: {
      method: string;
      url: string;
      headers: { Accept: string; Authorization: string };
    }) => Promise<any>,
  ) => {
    dispatch(getThreadStarted());
    const state = getState();

    try {
      axios({
        method: "get",
        url: `https://blab.to/api/threads/${threadId}`,
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + state.auth.authKey,
        },
      })
        .then((response: { data: Thread }) => {
          dispatch(getThreadSuccess(response.data));
        })
        .catch(() => {
          dispatch(getThreadFailure());
        });
    } catch (error) {
      dispatch(getThreadFailure());
    }
  };
}

export function getUserThreads() {
  return (
    dispatch: (arg0: ThreadActionTypes) => void,
    getState: () => GlobalState,
    axios: (arg0: {
      method: string;
      url: string;
      headers: { Accept: string; Authorization: string };
    }) => Promise<any>,
  ) => {
    dispatch(getUserThreadsStarted());
    const state = getState();

    try {
      axios({
        method: "get",
        url: `https://blab.to/api/threads`,
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + state.auth.authKey,
        },
      })
        .then((response: { data: ThreadResponse }) => {
          dispatch(getUserThreadsSuccess(response.data));
        })
        .catch(() => {
          dispatch(getUserThreadsFailure());
        });
    } catch (error) {
      dispatch(getUserThreadsFailure());
    }
  };
}
