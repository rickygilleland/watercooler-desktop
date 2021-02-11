export const GET_USER_DETAILS_SUCCESS = "GET_USER_DETAILS_SUCCESS";
export const GET_USER_DETAILS_FAILURE = "GET_USER_DETAILS_FAILURE";
export const UPDATE_USER_DETAILS_STARTED = "UPDATE_USER_DETAILS_START";
export const UPDATE_USER_DETAILS_SUCCESS = "UPDATE_USER_DETAILS_SUCCESS";
export const UPDATE_USER_DETAILS_FAILURE = "UPDATE_USER_DETAILS_FAILURE";

export interface User {
  id: number;
  avatar_url: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  last_login_at: string;
  organization_id: number;
  timezone: string;
  updated_at: string;
}

interface GetUserDetailsSuccessAction {
  type: typeof GET_USER_DETAILS_SUCCESS;
  payload: User;
}

interface GetUserDetailsFailureAction {
  type: typeof GET_USER_DETAILS_FAILURE;
}

interface UpdateUserDetailsStartedAction {
  type: typeof UPDATE_USER_DETAILS_STARTED;
}

interface UpdateUserDetailsSuccessAction {
  type: typeof UPDATE_USER_DETAILS_SUCCESS;
  payload: User;
}

interface UpdateUserDetailsFailureAction {
  type: typeof UPDATE_USER_DETAILS_FAILURE;
}

export type UserActionTypes =
  | GetUserDetailsSuccessAction
  | GetUserDetailsFailureAction
  | UpdateUserDetailsStartedAction
  | UpdateUserDetailsSuccessAction
  | UpdateUserDetailsFailureAction;
