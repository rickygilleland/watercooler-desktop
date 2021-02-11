import { Room } from "./room";
import { User } from "./user";

export const GET_ORGANIZATIONS_SUCCESS = "GET_ORGANIZATIONS_SUCCESS";
export const GET_ORGANIZATIONS_FAILURE = "GET_ORGANIZATIONS_FAILURE";
export const GET_ORGANIZATION_USERS_STARTED = "GET_ORGANIZATION_USERS_STARTED";
export const GET_ORGANIZATION_USERS_SUCCESS = "GET_ORGANIZATION_USERS_SUCCESS";
export const GET_ORGANIZATION_USERS_FAILURE = "GET_ORGANIZATION_USERS_FAILURE";
export const INVITE_USERS_STARTED = "INVITE_USERS_STARTED";
export const INVITE_USERS_SUCCESS = "INVITE_USERS_SUCCESS";
export const INVITE_USERS_FAILURE = "INVITE_USERS_FAILURE";
export const CREATE_ROOM_STARTED = "CREATE_ROOM_STARTED";
export const CREATE_ROOM_SUCCESS = "CREATE_ROOM_SUCCESS";
export const CREATE_ROOM_FAILURE = "CREATE_ROOM_FAILURE";
export const CREATE_CALL_STARTED = "CREATE_CALL_STARTED";
export const CREATE_CALL_SUCCESS = "CREATE_CALL_SUCCESS";
export const CREATE_CALL_FAILURE = "CREATE_CALL_FAILURE";

export interface OrganizationResponse extends Organization {
  billing: Billing;
  teams: Team[];
}

export interface OrganizationState {
  organization: Organization;
  teams: Team[];
  users: User[];
  billing: Billing;
  error: boolean;
  loading: boolean;
  inviteUsersSuccess: boolean;
  createRoomSuccess: boolean;
  createCallSuccess: boolean;
  lastCreatedRoomSlug: string | null;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
}

export interface Billing {
  plan: string;
  is_trial: boolean;
  video_enabled: boolean;
  screen_sharing_enabled: boolean;
}

export interface Team {
  id: number;
  name: string;
  is_default: boolean;
  avatar_url: string;
  organization_id: number;
  rooms: Room[];
  calls?: Room[];
}

interface GetOrganizationsSuccessAction {
  type: typeof GET_ORGANIZATIONS_SUCCESS;
  payload: OrganizationResponse;
}

interface GetOrganizationsFailureAction {
  type: typeof GET_ORGANIZATIONS_FAILURE;
}

interface GetOrganizationUsersStartedAction {
  type: typeof GET_ORGANIZATION_USERS_STARTED;
}

interface GetOrganizationUsersSuccessAction {
  type: typeof GET_ORGANIZATION_USERS_SUCCESS;
  payload: Partial<User>[];
}

interface GetOrganizationUsersFaiureAction {
  type: typeof INVITE_USERS_STARTED;
}

interface InviteUsersStartedAction {
  type: typeof GET_ORGANIZATION_USERS_FAILURE;
}

interface InviteUsersSuccessAction {
  type: typeof INVITE_USERS_SUCCESS;
}

interface InviteUsersFailureAction {
  type: typeof INVITE_USERS_FAILURE;
}

interface CreateRoomStartedAction {
  type: typeof CREATE_ROOM_STARTED;
}

interface CreateRoomSuccessAction {
  type: typeof CREATE_ROOM_SUCCESS;
  payload: Room;
}

interface CreateRoomFailureAction {
  type: typeof CREATE_ROOM_FAILURE;
}

interface CreateCallStartedAction {
  type: typeof CREATE_CALL_STARTED;
}

interface CreateCallSuccessAction {
  type: typeof CREATE_CALL_SUCCESS;
  payload: Room;
}

interface CreateCallFailureAction {
  type: typeof CREATE_CALL_FAILURE;
}

export type OrganizationActionTypes =
  | GetOrganizationsSuccessAction
  | GetOrganizationsFailureAction
  | GetOrganizationUsersStartedAction
  | GetOrganizationUsersSuccessAction
  | GetOrganizationUsersFaiureAction
  | InviteUsersStartedAction
  | InviteUsersSuccessAction
  | InviteUsersFailureAction
  | CreateRoomStartedAction
  | CreateRoomSuccessAction
  | CreateRoomFailureAction
  | CreateCallStartedAction
  | CreateCallSuccessAction
  | CreateCallFailureAction;
