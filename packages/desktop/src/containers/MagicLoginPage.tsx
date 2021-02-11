/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { AuthState } from "../store/types/auth";
import { User } from "../store/types/user";
import { authenticateUserMagicLink } from "../actions/auth";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import MagicLogin from "../components/MagicLogin";

function mapStateToProps(state: {
  auth: AuthState;
  user: User;
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
