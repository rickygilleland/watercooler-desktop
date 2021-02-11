import { User } from "./user";

export const GET_THREAD_STARTED = "GET_THREAD_STARTED";
export const GET_THREAD_SUCCESS = "GET_THREAD_SUCCESS";
export const GET_THREAD_FAILURE = "GET_THREAD_FAILURE";
export const GET_USER_THREADS_STARTED = "GET_USER_THREADS_STARTED";
export const GET_USER_THREADS_SUCCESS = "GET_USER_THREADS_SUCCESS";
export const GET_USER_THREADS_FAILURE = "GET_USER_THREADS_FAILURE";

export interface ThreadGroup {
  [threadId: string]: Thread;
}

export interface ThreadState {
  privateThreads: ThreadGroup;
  publicThreads: ThreadGroup;
  sharedThreads: ThreadGroup;
  roomThreads: ThreadGroup;
  loading: boolean;
  error: boolean;
}

export enum ThreadType {
  Private = "private",
  Public = "public",
  Shared = "shared",
  Room = "room",
}

export interface ThreadResponse {
  private_threads: Thread[];
  public_threads: Thread[];
  room_threads: Thread[];
}

export interface Thread {
  id: number;
  display_name: string;
  room_id: number | null;
  slug: string;
  type: ThreadType;
  users: User[];
  created_at: string;
  updated_at: string;
}

interface GetThreadStartedAction {
  type: typeof GET_THREAD_STARTED;
}

interface GetThreadSuccessAction {
  type: typeof GET_THREAD_SUCCESS;
  payload: Thread;
}

interface GetThreadFailureAction {
  type: typeof GET_THREAD_FAILURE;
}

interface GetUserThreadsStartedAction {
  type: typeof GET_USER_THREADS_STARTED;
}

interface GetUserThreadsSuccessAction {
  type: typeof GET_USER_THREADS_SUCCESS;
  payload: ThreadResponse;
}

interface GetUserThreadsFailureAction {
  type: typeof GET_USER_THREADS_FAILURE;
}

export type ThreadActionTypes =
  | GetThreadStartedAction
  | GetThreadSuccessAction
  | GetThreadFailureAction
  | GetUserThreadsStartedAction
  | GetUserThreadsSuccessAction
  | GetUserThreadsFailureAction;
