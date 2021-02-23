/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { AuthState } from "../store/types/auth";
import { ConnectedProps, connect } from "react-redux";
import { OrganizationState } from "../store/types/organization";
import { User } from "../store/types/user";
import { authenticateUserMagicLink } from "../actions/auth";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import MagicLogin from "../components/MagicLogin";

function mapStateToProps(
  state: {
    auth: AuthState;
    user: User;
    organization: OrganizationState;
  },
  ownProps: {
    match: {
      params: {
        code: string;
      };
    };
  },
) {
  return {
    auth: state.auth,
    user: state.user,
    organization: state.organization.organization,
    loginCode: ownProps.match.params.code,
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

const connector = connect(mapStateToProps, mapDispatchToProps);
export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(MagicLogin));
