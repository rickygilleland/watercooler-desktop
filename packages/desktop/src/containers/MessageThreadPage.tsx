/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { AuthState } from "../store/types/auth";
import { OrganizationState } from "../store/types/organization";
import { User } from "../store/types/user";
import { connect } from "react-redux";
import { createMessage, getMessagesByThreadId } from "../actions/message";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import MessageThread from "../components/MessageThread";

function mapStateToProps(state: {
  auth: AuthState;
  user: User;
  organization: OrganizationState;
  thread: {
    publicThreads: any;
    privateThreads: any;
    sharedThreads: any;
    roomThreads: any;
    loading: any;
  };
  message: {
    messages: any;
    loading: any;
    creating: any;
    lastCreatedMessage: any;
    error: any;
  };
  settings: any;
}) {
  return {
    auth: state.auth,
    user: state.user,
    organization: state.organization.organization,
    organizationUsers: state.organization.users,
    publicThreads: state.thread.publicThreads,
    privateThreads: state.thread.privateThreads,
    sharedThreads: state.thread.sharedThreads,
    roomThreads: state.thread.roomThreads,
    messages: state.message.messages,
    threadLoading: state.thread.loading,
    messageLoading: state.message.loading,
    messageCreating: state.message.creating,
    lastCreatedMessage: state.message.lastCreatedMessage,
    messageError: state.message.error,
    settings: state.settings,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return bindActionCreators(
    {
      createMessage,
      getMessagesByThreadId,
      push,
    },
    dispatch,
  );
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MessageThread),
);
