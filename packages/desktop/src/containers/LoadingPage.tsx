/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  getOrganizationUsers,
  getOrganizations,
} from "../actions/organization";
import { getUserDetails } from "../actions/user";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import Loading from "../components/Loading";
import { User } from "../store/types/user";
import { AuthState } from "../store/types/auth";

function mapStateToProps(state: {
  user: User;
  organization: { organization: any; users: any; loading: any; teams: any };
  auth: AuthState;
}) {
  return {
    user: state.user,
    organization: state.organization.organization,
    organizationUsers: state.organization.users,
    organizationLoading: state.organization.loading,
    teams: state.organization.teams,
    auth: state.auth,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return bindActionCreators(
    {
      getOrganizations,
      getOrganizationUsers,
      getUserDetails,
      push,
    },
    dispatch,
  );
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Loading),
);
