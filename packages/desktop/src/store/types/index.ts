import { AuthState } from "./auth";
import { OrganizationState } from "./organization";

export interface GlobalState {
  auth: AuthState;
  organization: OrganizationState;
}
