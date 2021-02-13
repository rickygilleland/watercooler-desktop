/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { AuthState } from "../store/types/auth";
import { ConnectedProps, connect } from "react-redux";
import { OrganizationState } from "../store/types/organization";
import { RoomState } from "../store/types/room";
import { SettingsState } from "../store/types/settings";
import { User } from "../store/types/user";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import RoomsList from "../components/RoomsList";

function mapStateToProps(state: {
  auth: AuthState;
  user: User;
  organization: OrganizationState;
  room: RoomState;
  settings: SettingsState;
}) {
  return {
    auth: state.auth,
    user: state.user,
    organization: state.organization.organization,
    organizationUsers: state.organization.users,
    teams: state.organization.teams,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return bindActionCreators(
    {
      push,
    },
    dispatch,
  );
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(RoomsList));
