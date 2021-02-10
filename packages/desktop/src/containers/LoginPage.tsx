/* eslint-disable @typescript-eslint/no-explicit-any */
import { requestLoginCode, authenticateUser } from "../actions/auth";
import { getUserDetails } from "../actions/user";
import { getOrganizations } from "../actions/organization";
import { connect } from "react-redux";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { withRouter } from "react-router-dom";
import { push } from "connected-react-router";
import Login from "../components/Login";

function mapStateToProps(state: {
  auth: any;
  user: any;
  organization: { organization: any };
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));
