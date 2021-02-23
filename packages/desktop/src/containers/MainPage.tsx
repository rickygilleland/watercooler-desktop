import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { AuthState } from "../store/types/auth";
import { ConnectedProps, connect } from "react-redux";
import { OrganizationState } from "../store/types/organization";
import { SettingsState } from "../store/types/settings";
import { User } from "../store/types/user";
import { createRoom } from "../actions/organization";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import Main from "../components/Main";

function mapStateToProps(state: {
  auth: AuthState;
  user: User;
  organization: OrganizationState;
  settings: SettingsState;
}) {
  return {
    auth: state.auth,
    user: state.user,
    organization: state.organization.organization,
    organizationUsers: state.organization.users,
    billing: state.organization.billing,
    organizationLoading: state.organization.loading,
    lastCreatedRoomSlug: state.organization.lastCreatedRoomSlug,
    createRoomSuccess: state.organization.createRoomSuccess,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return bindActionCreators(
    {
      createRoom,
      push,
    },
    dispatch,
  );
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(Main));
