/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { AuthState } from "../store/types/auth";
import { OrganizationState } from "../store/types/organization";
import { SettingsState } from "../store/types/settings";
import { ThreadState } from "../store/types/thread";
import { User } from "../store/types/user";
import {
  addNewItemFromNotification,
  getLibraryItems,
} from "../actions/library";
import { addNewMessageFromNotification } from "../actions/message";
import { connect } from "react-redux";
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
import Sidebar from "../components/Sidebar";

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

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Sidebar),
);
