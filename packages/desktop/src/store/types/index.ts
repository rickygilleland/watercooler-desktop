import { AuthActionTypes, AuthState } from "./auth";
import { OrganizationActionTypes, OrganizationState } from "./organization";
import { RoomActionTypes, RoomState } from "./room";
import { RouteComponentProps } from "react-router";
import { ThreadState } from "./thread";
import { User, UserActionTypes } from "./user";

export interface GlobalState extends RouteComponentProps {
  auth: AuthState;
  organization: OrganizationState;
  room: RoomState;
  user: User;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any;
  library: any;
  message: any;
  thread: ThreadState;
  settings: any;
}

export type GlobalActionTypes =
  | AuthActionTypes
  | OrganizationActionTypes
  | RoomActionTypes
  | UserActionTypes;
