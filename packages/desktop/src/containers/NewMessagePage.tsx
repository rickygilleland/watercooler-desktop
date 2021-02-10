/* eslint-disable @typescript-eslint/no-explicit-any */
import { connect, ConnectedProps } from "react-redux";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import NewMessage from "../components/NewMessage";
import { createMessage } from "../actions/message";

function mapStateToProps(state: {
  auth: any;
  user: any;
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
