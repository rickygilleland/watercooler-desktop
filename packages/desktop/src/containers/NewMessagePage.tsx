/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { AuthState } from "../store/types/auth";
import { ConnectedProps, connect } from "react-redux";
import { MessageState } from "../store/types/message";
import { OrganizationState } from "../store/types/organization";
import { SettingsState } from "../store/types/settings";
import { User } from "../store/types/user";
import { createMessage } from "../actions/message";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import NewMessage from "../components/NewMessage";

function mapStateToProps(
  state: {
    auth: AuthState;
    user: User;
    organization: OrganizationState;
    settings: SettingsState;
    message: MessageState;
  },
  ownProps: {
    location: {
      state: {
        recipient: User;
      };
    };
  },
) {
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
    recipient: ownProps.location.state.recipient,
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
