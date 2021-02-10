/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getOrganizations,
  getOrganizationUsers,
} from "../actions/organization";
import { getUserDetails } from "../actions/user";
import { connect } from "react-redux";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import Loading from "../components/Loading";

function mapStateToProps(state: {
  user: any;
  organization: { organization: any; users: any; loading: any; teams: any };
  auth: any;
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
