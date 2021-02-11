/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { ConnectedProps, connect } from "react-redux";
import { createMessage } from "../actions/message";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import NewMessage from "../components/NewMessage";
import { AuthState } from "../store/types/auth";
import { User } from "../store/types/user";

function mapStateToProps(state: {
  auth: AuthState;
  user: User;
  organization: { organization: any; users: any };
  settings: any;
  message: { creating: any; lastCreatedMessage: any; error: any };
}) {
  return {
    auth: state.auth,
    user: state.user,
    organization: state.organization.organization,
    organizationUsers: state.organization.users,
    settings: state.settings,
    messageCreating: state.message.creating,
    lastCreatedMessage: state.message.lastCreatedMessage,
    messageLoading: state.message.loading,
    messageError: state.message.error,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return bindActionCreators(
    {
      createMessage,
      push,
    },
    dispatch,
  );
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(NewMessage));
