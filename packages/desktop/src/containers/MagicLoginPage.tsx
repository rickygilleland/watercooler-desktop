/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { authenticateUserMagicLink } from "../actions/auth";
import { connect } from "react-redux";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { withRouter } from "react-router-dom";
import { push } from "connected-react-router";
import MagicLogin from "../components/MagicLogin";

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
      authenticateUserMagicLink,
      push,
    },
    dispatch,
  );
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MagicLogin),
);
