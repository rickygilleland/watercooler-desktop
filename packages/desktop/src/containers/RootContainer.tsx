/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { AuthState } from "../store/types/auth";
import { ConnectedProps, connect } from "react-redux";
import { OrganizationState } from "../store/types/organization";
import { SettingsState } from "../store/types/settings";
import { ThreadState } from "../store/types/thread";
import { User } from "../store/types/user";
import {
  addNewItemFromNotification,
  getLibraryItems,
} from "../actions/library";
import { addNewMessageFromNotification } from "../actions/message";
import {
  createCall,
  createRoom,
  getOrganizationUsers,
  getOrganizations,
  inviteUsers,
} from "../actions/organization";
import {
  getAvailableDevices,
  updateDefaultDevices,
  updateExperimentalSettings,
  updateRoomSettings,
} from "../actions/settings";
import { getThread, getUserThreads } from "../actions/thread";
import { push } from "connected-react-router";
import { updateUserDetails } from "../actions/user";
import { userLogout } from "../actions/auth";
import { withRouter } from "react-router-dom";
import RootComponent from "../components/RootComponent";

function mapStateToProps(
  state: {
    user: User;
    organization: OrganizationState;
    thread: ThreadState;
    auth: AuthState;
    settings: SettingsState;
  },
  ownProps: { location: { pathname: string } },
) {
  return {
    user: state.user,
    organization: state.organization.organization,
    billing: state.organization.billing,
    organizationUsers: state.organization.users,
    organizationLoading: state.organization.loading,
    inviteUsersSuccess: state.organization.inviteUsersSuccess,
    createRoomSuccess: state.organization.createRoomSuccess,
    lastCreatedRoomSlug: state.organization.lastCreatedRoomSlug,
    teams: state.organization.teams,
    publicThreads: state.thread.publicThreads,
    privateThreads: state.thread.privateThreads,
    sharedThreads: state.thread.sharedThreads,
    auth: state.auth,
    currentURL: ownProps.location.pathname,
    settings: state.settings,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return bindActionCreators(
    {
      userLogout,
      updateUserDetails,
      getOrganizations,
      getOrganizationUsers,
      inviteUsers,
      createRoom,
      createCall,
      getUserThreads,
      getThread,
      getLibraryItems,
      addNewMessageFromNotification,
      addNewItemFromNotification,
      getAvailableDevices,
      updateDefaultDevices,
      updateExperimentalSettings,
      updateRoomSettings,
      push,
    },
    dispatch,
  );
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(RootComponent));
