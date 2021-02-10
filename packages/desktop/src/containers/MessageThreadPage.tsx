/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { connect } from "react-redux";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import MessageThread from "../components/MessageThread";
import { createMessage, getMessagesByThreadId } from "../actions/message";

function mapStateToProps(state: {
  auth: any;
  user: any;
  organization: { organization: any; users: any };
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
