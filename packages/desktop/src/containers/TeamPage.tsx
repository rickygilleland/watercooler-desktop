import { connect, ConnectedProps } from "react-redux";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import { getOrganizationUsers, inviteUsers } from "../actions/organization";
import Team from "../components/Team";

function mapStateToProps(state: {
  auth: any;
  user: any;
  organization: {
    organization: any;
    users: any;
    billing: any;
    loading: any;
    inviteUsersSuccess: any;
    teams: any;
  };
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
