/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { AuthState } from "../store/types/auth";
import { ConnectedProps, connect } from "react-redux";
import { OrganizationState } from "../store/types/organization";
import { User } from "../store/types/user";
import { authenticateUser, requestLoginCode } from "../actions/auth";
import { getOrganizations } from "../actions/organization";
import { getUserDetails } from "../actions/user";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import Login from "../components/Login";

function mapStateToProps(state: {
  auth: AuthState;
  user: User;
  organization: OrganizationState;
}) {
  return {
    auth: state.auth,
    user: state.user,
    organization: state.organization.organization,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return bindActionCreators(
    {
      requestLoginCode,
      authenticateUser,
      getUserDetails,
      getOrganizations,
      push,
    },
    dispatch,
  );
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(Login));
