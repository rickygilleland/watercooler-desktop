import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import NewMessage from "../components/NewMessage";
import { createMessage } from "../actions/message";

function mapStateToProps(state) {
  return {
    auth: state.auth,
    user: state.user,
    organization: state.organization.organization,
    organizationUsers: state.organization.users,
    settings: state.settings,
    messageCreating: state.message.creating,
    lastCreatedMessage: state.message.lastCreatedMessage,
    messageError: state.message.error,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createMessage,
      push,
    },
    dispatch
  );
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(NewMessage)
);
