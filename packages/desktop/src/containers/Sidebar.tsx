/* eslint-disable @typescript-eslint/no-explicit-any */
import { userLogout } from "../actions/auth";
import { updateUserDetails } from "../actions/user";
import {
  getOrganizations,
  getOrganizationUsers,
  inviteUsers,
  createRoom,
  createCall,
} from "../actions/organization";
import { getUserThreads, getThread } from "../actions/thread";
import { addNewMessageFromNotification } from "../actions/message";
import {
  addNewItemFromNotification,
  getLibraryItems,
} from "../actions/library";
import {
  getAvailableDevices,
  updateDefaultDevices,
  updateExperimentalSettings,
  updateRoomSettings,
} from "../actions/settings";
import { connect } from "react-redux";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function mapStateToProps(
  state: {
    user: any;
    organization: {
      organization: any;
      billing: any;
      users: any;
      loading: any;
      inviteUsersSuccess: any;
      createRoomSuccess: any;
      lastCreatedRoomSlug: any;
      teams: any;
    };
    thread: { publicThreads: any; privateThreads: any; sharedThreads: any };
    auth: any;
    settings: any;
  },
  ownProps: { location: { pathname: any } },
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
