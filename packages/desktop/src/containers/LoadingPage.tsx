/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { AuthState } from "../store/types/auth";
import { ConnectedProps, connect } from "react-redux";
import { OrganizationState } from "../store/types/organization";
import { User } from "../store/types/user";
import {
  getOrganizationUsers,
  getOrganizations,
} from "../actions/organization";
import { getUserDetails } from "../actions/user";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import Loading from "../components/Loading";

function mapStateToProps(state: {
  user: User;
  organization: OrganizationState;
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

const connector = connect(mapStateToProps, mapDispatchToProps);
export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(Loading));
