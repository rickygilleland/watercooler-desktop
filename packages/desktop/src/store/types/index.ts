import { AuthActionTypes, AuthState } from "./auth";
import { LibraryState } from "./library";
import { MessageState } from "./message";
import { OrganizationActionTypes, OrganizationState } from "./organization";
import { RoomActionTypes, RoomState } from "./room";
import { RouteComponentProps } from "react-router";
import { SettingsState } from "./settings";
import { ThreadState } from "./thread";
import { User, UserActionTypes } from "./user";

export interface GlobalState extends RouteComponentProps {
  auth: AuthState;
  organization: OrganizationState;
  room: RoomState;
  user: User;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any;
  library: LibraryState;
  message: MessageState;
  thread: ThreadState;
  settings: SettingsState;
}

export interface AuthenticatedRequestHeaders {
  Accept: string;
  Authorization: string;
}

export type GlobalActionTypes =
  | AuthActionTypes
  | OrganizationActionTypes
  | RoomActionTypes
  | UserActionTypes;
