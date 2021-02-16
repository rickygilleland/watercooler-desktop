import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { AuthState } from "../store/types/auth";
import { ConnectedProps, connect } from "react-redux";
import { OrganizationState } from "../store/types/organization";
import { RoomState } from "../store/types/room";
import { SettingsState } from "../store/types/settings";
import { User } from "../store/types/user";
import { addUserToRoom, getRoomUsers } from "../actions/room";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import Room from "../components/Room";

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
    billing: state.organization.billing,
    organizationUsers: state.organization.users,
    teams: state.organization.teams,
    roomLoading: state.room.loading,
    addUserLoading: state.room.addUserLoading,
    roomUsers: state.room.users,
    settings: state.settings,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return bindActionCreators(
    {
      getRoomUsers,
      addUserToRoom,
      push,
    },
    dispatch,
  );
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(Room));
