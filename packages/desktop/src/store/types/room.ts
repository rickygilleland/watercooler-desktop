import { User } from "./user";

export const GET_ROOM_USERS_STARTED = "GET_ROOM_USERS_STARTED";
export const GET_ROOM_USERS_SUCCESS = "GET_ROOM_USERS_SUCCESS";
export const GET_ROOM_USERS_FAILURE = "GET_ROOM_USERS_FAILURE";
export const ADD_USER_TO_ROOM_STARTED = "ADD_USER_TO_ROOM_STARTED";
export const ADD_USER_TO_ROOM_SUCCESS = "ADD_USER_TO_ROOM_SUCCESS";
export const ADD_USER_TO_ROOM_FAILURE = "ADD_USER_TO_ROOM_FAILURE";

export enum RoomType {
  Room = "room",
  Call = "call",
}

export interface Room {
  id: number;
  team_id: number;
  organization_id: number;
  name: string;
  slug: string;
  type?: RoomType;
  is_private: boolean;
  video_enabled: boolean;
  channel_id: string;
  secret: string;
  pin: string;
  is_active: boolean;
  server_id: number;
  participants?: number[];
}

export interface RoomState {
  users: User[];
  loading: boolean;
  addUserLoading: boolean;
  error: boolean;
}

interface GetRoomUsersStartedAction {
  type: typeof GET_ROOM_USERS_STARTED;
}
interface GetRoomUsersSuccessAction {
  type: typeof GET_ROOM_USERS_SUCCESS;
  payload: User[];
}

interface GetRoomUsersFailureAction {
  type: typeof GET_ROOM_USERS_FAILURE;
}

interface AddUserToRoomStartedAction {
  type: typeof ADD_USER_TO_ROOM_STARTED;
}

interface AddUserToRoomSuccessAction {
  type: typeof ADD_USER_TO_ROOM_SUCCESS;
}

interface AddUserToRoomFailureAction {
  type: typeof ADD_USER_TO_ROOM_FAILURE;
}

export type RoomActionTypes =
  | GetRoomUsersStartedAction
  | GetRoomUsersSuccessAction
  | GetRoomUsersFailureAction
  | AddUserToRoomStartedAction
  | AddUserToRoomSuccessAction
  | AddUserToRoomFailureAction;
