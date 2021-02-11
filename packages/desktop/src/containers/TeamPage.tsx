import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { AuthState } from "../store/types/auth";
import { ConnectedProps, connect } from "react-redux";
import { OrganizationState } from "../store/types/organization";
import { User } from "../store/types/user";
import { getOrganizationUsers, inviteUsers } from "../actions/organization";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import Team from "../components/Team";

function mapStateToProps(state: {
  auth: AuthState;
  user: User;
  organization: OrganizationState;
}) {
  return {
    auth: state.auth,
    user: state.user,
    organization: state.organization.organization,
    organizationUsers: state.organization.users,
    billing: state.organization.billing,
    organizationLoading: state.organization.loading,
    inviteUsersSuccess: state.organization.inviteUsersSuccess,
    teams: state.organization.teams,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return bindActionCreators(
    {
      getOrganizationUsers,
      inviteUsers,
      push,
    },
    dispatch,
  );
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(Team));
