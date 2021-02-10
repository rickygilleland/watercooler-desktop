import React from "react";
import { Switch, Route, NavLink, Redirect } from "react-router-dom";
import routes from "../constants/routes.json";
import { each, debounce } from "lodash";
import { DateTime } from "luxon";
import {
  Row,
  Col,
  Button,
  Navbar,
  Dropdown,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faCircle,
  faSignOutAlt,
  faUserFriends,
  faPlusSquare,
  faCog,
  faUserPlus,
  faUsers,
  faLock,
  faCamera,
  faVideo,
  faMicrophone,
  faChevronCircleLeft,
  faChevronCircleRight,
  faDesktop,
  faBookOpen,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { getOrganizationUsers } from "../actions/organization";
import EnsureLoggedInContainer from "../containers/EnsureLoggedInContainer";
import LibraryPage from "../containers/LibraryPage";
import RoomPage from "../containers/RoomPage";
import TeamPage from "../containers/TeamPage";
import ErrorBoundary from "./ErrorBoundary";
import SettingsModal from "./SettingsModal";
import RoomSettingsModal from "./RoomSettingsModal";
import ExperimentalSettingsModal from "./ExperimentalSettingsModal";
import ManageUsersModal from "./ManageUsersModal";
import InviteUsersModal from "./InviteUsersModal";
import ManageCameraModal from "./ManageCameraModal";
import RoomsModal from "./RoomsModal";
import NewCallModal from "./NewCallModal";
import IncomingCallModal from "./IncomingCallModal";
import NewMessagePage from "../containers/NewMessagePage";
import MessageThreadPage from "../containers/MessageThreadPage";
import { isMobile } from "react-device-detect";
import posthog from "posthog-js";
import Pusher from "pusher-js";
import { getUserThreads, getThread } from "../actions/thread";

if (process.env.REACT_APP_PLATFORM != "web") {
  var { BrowserWindow, nativeTheme } = require("electron").remote;
} else {
  var BrowserWindow = null;
  var nativeTheme = null;
  var MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY = null;
  var MAIN_WINDOW_WEBPACK_ENTRY = null;
}

class Sidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      timeInterval: null,
      updateInterval: null,
      dimensions: {
        width: 0,
        height: 0,
      },
      showSettingsModal: false,
      showExperimentalSettingsModal: false,
      showInviteUsersModal: false,
      showManageUsersModal: false,
      showManageCameraModal: false,
      showRoomSettingsModal: false,
      showRoomsModal: false,
      showCallsModal: false,
      showIncomingCallModal: false,
      incomingCall: null,
      roomsModalReset: false,
      pusherInstance: null,
      organizationPresenceChannel: false,
      userPrivateNotificationChannel: false,
      organizationUsersOnline: [],
      currentTime: DateTime.local(),
      backgroundBlurWindow: null,
      faceTrackingNetWindow: null,
      sidebarIsVisible: true,
      isLightMode: nativeTheme == null || !nativeTheme.shouldUseDarkColors,
    };

    this.userLogout = this.userLogout.bind(this);
    this.handleIncomingCall = this.handleIncomingCall.bind(this);
    this.handleShowModal = this.handleShowModal.bind(this);
  }

  componentDidMount() {
    var {
      pusherInstance,
      organizationPresenceChannel,
      userPrivateNotificationChannel,
    } = this.state;
    const {
      push,
      auth,
      user,
      organization,
      getOrganizations,
      updateUserDetails,
      getUserThreads,
      addNewMessageFromNotification,
      addNewItemFromNotification,
      getLibraryItems,
    } = this.props;

    if (!auth.isLoggedIn) {
      return;
    }

    if (process.env.REACT_APP_PLATFORM != "web") {
      nativeTheme.on("updated", () => {
        this.setState({
          isLightMode: nativeTheme.shouldUseDarkColors ? false : true,
        });
      });
    }

    posthog.identify(user.id);
    posthog.people.set({ email: user.email });

    if (process.env.REACT_APP_PLATFORM != "web") {
      posthog.register({
        organization_id: organization.id,
        version: require("electron").remote.app.getVersion(),
      });
    }

    if (organizationPresenceChannel && !auth.isLoggedIn) {
      pusherInstance.disconnect();
      this.setState({
        organizationPresenceChannel: false,
        pusherInstance: null,
        userPrivateNotificationChannel: false,
      });
    }

    var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (user.timezone != timezone) {
      updateUserDetails(timezone);
    }

    let timeInterval = setInterval(
      function () {
        var currentTime = DateTime.local();

        if (
          currentTime
            .setZone(user.timezone)
            .toLocaleString(DateTime.TIME_SIMPLE) !=
          this.state.currentTime
            .setZone(user.timezone)
            .toLocaleString(DateTime.TIME_SIMPLE)
        ) {
          this.setState({ currentTime });
        }
      }.bind(this),
      1000
    );

    let updateInterval = setInterval(
      function () {
        getOrganizations();
      }.bind(this),
      300000
    );

    this.setState({ timeInterval, updateInterval });

    if (
      auth.isLoggedIn &&
      organization != null &&
      !organizationPresenceChannel
    ) {
      if (pusherInstance == null) {
        pusherInstance = new Pusher("3eb4f9d419966b6e1e0b", {
          forceTLS: true,
          cluster: "mt1",
          authEndpoint: "https://blab.to/broadcasting/auth",
          authTransport: "ajax",
          auth: {
            headers: {
              Authorization: `Bearer ${this.props.auth.authKey}`,
              Accept: "application/json",
            },
          },
        });

        this.setState({ pusherInstance });
      }

      var presence_channel = pusherInstance.subscribe(
        `presence-organization.${organization.id}`
      );
      var that = this;

      this.setState({ organizationPresenceChannel: true });

      presence_channel.bind_global(function (event, data) {
        if (event == "pusher:subscription_succeeded") {
          var onlineUsers = [];

          each(data.members, (member) => {
            onlineUsers.push(member.id);
          });

          that.setState({ organizationUsersOnline: onlineUsers });
        }

        if (event == "pusher:member_added") {
          var updatedOnlineUsers = [];

          that.state.organizationUsersOnline.forEach((user) => {
            updatedOnlineUsers.push(user);
          });

          updatedOnlineUsers.push(data.id);

          that.setState({ organizationUsersOnline: updatedOnlineUsers });
        }

        if (event == "pusher:member_removed") {
          var updatedOnlineUsers = [];

          that.state.organizationUsersOnline.forEach((user) => {
            if (user != data.id) {
              updatedOnlineUsers.push(user);
            }
          });

          that.setState({ organizationUsersOnline: updatedOnlineUsers });
        }

        if (event == "billing.updated") {
          return getOrganizations();
        }
      });

      if (userPrivateNotificationChannel === false) {
        var user_channel = pusherInstance.subscribe(`private-user.${user.id}`);
        var that = this;

        this.setState({ userPrivateNotificationChannel: user_channel });

        user_channel.bind_global(function (event, data) {
          if (event == "room.created") {
            return getOrganizations();
          }

          if (event == "room.user.invited") {
            return getOrganizations();
          }

          /*if (event == "call.created") {
                        getOrganizations();

                        that.setState({ showIncomingCallModal: true, incomingCall: data.room })
                    }*/

          if (
            event == "user.messages.created" ||
            event == "user.messages.updated"
          ) {
            var activeThread = false;
            if (data.thread.type == "private") {
              Object.keys(that.props.privateThreads).map((threadId) => {
                if (threadId == data.thread.id) {
                  activeThread = that.props.privateThreads[threadId];
                }
              });
            }

            if (activeThread == false) {
              that.props.getThread(data.thread.id);
            }

            addNewMessageFromNotification(data.message);

            if (event == "user.messages.created") {
              const newMessageNotification = new Notification("New Blab", {
                body: `${data.message.user.first_name} sent you a voice message.`,
              });

              newMessageNotification.onClick = () => {
                push(`/thread/${data.thread.type}/${data.thread.slug}`);
              };
            }
          }

          if (event == "library.items.updated") {
            addNewItemFromNotification(data.item);
          }
        });
      }
    }

    if (organizationPresenceChannel && !auth.isLoggedIn) {
      pusherInstance.disconnect();
      this.setState({
        organizationPresenceChannel: false,
        userPrivateNotificationChannel: false,
        pusherInstance: null,
      });
    }

    /*
        if (process.env.REACT_APP_PLATFORM != "web") {

            let backgroundBlurWindow = new BrowserWindow({ 
                show: false,
                webPreferences: {
                    nodeIntegration: true,
                    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
                    devTools: true,
                    backgroundThrottling: false
                }
            })

            backgroundBlurWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY+"#/blur_net_background");

            let faceTrackingNetWindow = new BrowserWindow({ 
                show: false,
                webPreferences: {
                    nodeIntegration: true,
                    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
                    devTools: true,
                    backgroundThrottling: false
                }
            })

            faceTrackingNetWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY+"#/face_tracking_net_background");

            this.setState({ backgroundBlurWindow, faceTrackingNetWindow });
        }*/

    getUserThreads();
    getLibraryItems();
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      createRoomSuccess,
      lastCreatedRoomSlug,
      location,
      billing,
      getOrganizations,
      auth,
    } = this.props;

    if (auth.isLoggedIn && Object.keys(billing).length === 0) {
      getOrganizations();
    }

    if (
      prevProps.createRoomSuccess != createRoomSuccess &&
      createRoomSuccess &&
      !location.pathname.includes("/room")
    ) {
      this.setState({ showRoomsModal: false, roomsModalReset: true });
      return this.props.push(`/room/${lastCreatedRoomSlug}`);
    }
  }

  componentWillUnmount() {
    const { organization, user } = this.props;
    const {
      organizationPresenceChannel,
      pusherInstance,
      timeInterval,
      updateInterval,
      faceTrackingNetWindow,
      backgroundBlurWindow,
    } = this.state;

    if (timeInterval != null) {
      clearInterval(timeInterval);
    }

    if (updateInterval != null) {
      clearInterval(updateInterval);
    }

    if (
      organizationPresenceChannel &&
      Object.keys(organization).length === 0 &&
      organization.id != null
    ) {
      pusherInstance.unsubscribe(`presence-room.${organization.id}`);
      pusherInstance.unsubscribe(`user.${user.id}`);
      pusherInstance.disconnect();
    }

    if (faceTrackingNetWindow != null) {
      faceTrackingNetWindow.destroy();
    }

    if (backgroundBlurWindow != null) {
      backgroundBlurWindow.destroy();
    }
  }

  userLogout() {
    const { userLogout, organization, user } = this.props;
    const {
      organizationPresenceChannel,
      userPrivateNotificationChannel,
      pusherInstance,
    } = this.state;

    if (organizationPresenceChannel && organization.id != null) {
      pusherInstance.unsubscribe(`presence-room.${organization.id}`);
    }

    if (userPrivateNotificationChannel !== false) {
      pusherInstance.unsubscribe(`private-user.${user.id}`);
    }

    if (pusherInstance != null) {
      pusherInstance.disconnect();
    }

    posthog.reset();

    return userLogout();
  }

  handleIncomingCall(acceptOrDecline) {
    const { userPrivateNotificationChannel, incomingCall } = this.state;
  }

  handleShowModal(modalToShow) {
    if (modalToShow == "inviteUsers") {
      return this.setState({
        showSettingsModal: false,
        showInviteUsersModal: true,
      });
    }

    if (modalToShow == "cameraSettings") {
      return this.setState({
        showSettingsModal: false,
        showManageCameraModal: true,
      });
    }

    if (modalToShow == "experimentalSettings") {
      return this.setState({
        showSettingsModal: false,
        showExperimentalSettingsModal: true,
      });
    }

    if (modalToShow == "roomSettings") {
      return this.setState({
        showSettingsModal: false,
        showRoomSettingsModal: true,
      });
    }
  }

  render() {
    const {
      organization,
      billing,
      teams,
      privateThreads,
      publicThreads,
      user,
      auth,
      push,
      currentUrl,
      getOrganizationUsers,
      organizationUsers,
      organizationLoading,
      inviteUsers,
      inviteUsersSuccess,
      getAvailableDevices,
      settings,
      updateExperimentalSettings,
      updateRoomSettings,
      updateDefaultDevices,
      createRoom,
      createRoomSuccess,
      createCall,
      lastCreatedRoomSlug,
    } = this.props;
    const {
      currentTime,
      showSettingsModal,
      showRoomSettingsModal,
      showExperimentalSettingsModal,
      showInviteUsersModal,
      showManageUsersModal,
      showRoomsModal,
      showCallsModal,
      showIncomingCallModal,
      incomingCall,
      roomsModalReset,
      showManageCameraModal,
      pusherInstance,
      userPrivateNotificationChannel,
      organizationUsersOnline,
      backgroundBlurWindow,
      faceTrackingNetWindow,
      sidebarIsVisible,
      isLightMode,
    } = this.state;

    teams.forEach((team) => {
      if (team.name.length > 20) {
        team.name = team.name.slice(0, 16);
        team.name = team.name.trim() + "...";
      }
    });

    Object.keys(privateThreads).forEach((threadId) => {
      if (privateThreads[threadId].name.length > 25) {
        privateThreads[threadId].display_name = privateThreads[
          threadId
        ].name.slice(0, 21);
        privateThreads[threadId].display_name =
          privateThreads[threadId].display_name.trim() + "...";
      } else {
        privateThreads[threadId].display_name = privateThreads[threadId].name;
      }
    });

    let curTeam = teams[0];
    let rooms;
    let sidebarPrivateThreads;

    try {
      rooms = (
        <div key={"rooms_" + curTeam.id} className="mt-2">
          <Row>
            <Col xs={9}>
              <p
                className={
                  "pt-1 mb-0 pl-3" +
                  (!isLightMode ||
                  process.env.REACT_APP_PLATFORM == "web" ||
                  process.platform != "darwin"
                    ? " text-light"
                    : " text-dark")
                }
                style={{ fontSize: "1rem", fontWeight: 800 }}
              >
                Rooms
              </p>
            </Col>
            <Col xs={3}>
              {billing.plan == "Free" && (
                <OverlayTrigger
                  placement="bottom-start"
                  overlay={
                    <Tooltip id="tooltip-disabled">
                      Upgrade to create more rooms.
                    </Tooltip>
                  }
                >
                  <Button
                    variant="link"
                    style={{ color: "#fff", fontSize: ".9rem" }}
                    disabled={true}
                  >
                    <FontAwesomeIcon icon={faPlusSquare} />
                  </Button>
                </OverlayTrigger>
              )}
              {billing.plan != "Free" && (
                <Button
                  variant="link"
                  style={{ color: "#fff", fontSize: ".9rem" }}
                  onClick={() => this.setState({ showRoomsModal: true })}
                >
                  <FontAwesomeIcon icon={faPlusSquare} />
                </Button>
              )}
            </Col>
          </Row>
          <div>
            {curTeam.rooms.length > 0 ? (
              <ul className="nav flex-column mt-1">
                {curTeam.rooms.map((room, roomKey) => (
                  <li key={roomKey} className="nav-item">
                    <NavLink
                      exact={true}
                      activeStyle={{
                        fontWeight: "bold",
                      }}
                      className={"d-block py-1 ph-no-capture"}
                      to={{
                        pathname: `/room/${room.slug}`,
                        state: {
                          team: curTeam,
                          room: room,
                        },
                      }}
                    >
                      <p
                        className={
                          "mb-0 pl-3 ph-no-capture" +
                          (!isLightMode ||
                          process.env.REACT_APP_PLATFORM == "web" ||
                          process.platform != "darwin"
                            ? " text-light"
                            : " text-dark")
                        }
                      >
                        {room.is_private ? (
                          <FontAwesomeIcon
                            icon={faLock}
                            style={{ fontSize: ".7rem", marginRight: ".2rem" }}
                          />
                        ) : room.video_enabled && billing.plan != "Free" ? (
                          <FontAwesomeIcon
                            icon={faVideo}
                            style={{ fontSize: ".7rem", marginRight: ".2rem" }}
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faMicrophone}
                            style={{ fontSize: ".7rem", marginRight: ".2rem" }}
                          />
                        )}{" "}
                        {room.name}
                      </p>
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              ""
            )}
          </div>
        </div>
      );

      sidebarPrivateThreads = (
        <div key={"threads_" + curTeam.id} className="mt-2">
          <Row>
            <Col xs={9}>
              <p
                className={
                  "pt-1 mb-0 pl-3" +
                  (!isLightMode ||
                  process.env.REACT_APP_PLATFORM == "web" ||
                  process.platform != "darwin"
                    ? " text-light"
                    : " text-dark")
                }
                style={{ fontSize: "1rem", fontWeight: 800 }}
              >
                Direct Messages
              </p>
            </Col>
            <Col xs={3}>
              <NavLink
                exact={true}
                activeStyle={{
                  fontWeight: "bold",
                }}
                className={
                  "d-block btn" +
                  (!isLightMode ||
                  process.env.REACT_APP_PLATFORM == "web" ||
                  process.platform != "darwin"
                    ? " text-light"
                    : " text-dark")
                }
                to={{
                  pathname: `/messages/new`,
                }}
              >
                <FontAwesomeIcon icon={faPlusSquare} />
              </NavLink>
            </Col>
          </Row>
          <div>
            <ul className="nav flex-column mt-1">
              {Object.keys(privateThreads).length == 0 && (
                <li key="new_dm_link" className="nav-item">
                  <NavLink
                    exact={true}
                    activeStyle={{
                      fontWeight: "bold",
                    }}
                    className="d-block py-1"
                    to={{
                      pathname: `/messages/new`,
                    }}
                  >
                    <p
                      className={
                        "mb-0 pl-3" +
                        (!isLightMode ||
                        process.env.REACT_APP_PLATFORM == "web" ||
                        process.platform != "darwin"
                          ? " text-light"
                          : " text-dark")
                      }
                    >
                      Start Your First DM
                    </p>
                  </NavLink>
                </li>
              )}
              {Object.keys(privateThreads).map((threadId) => (
                <li key={threadId} className="nav-item">
                  <NavLink
                    exact={true}
                    activeStyle={{
                      fontWeight: "bold",
                    }}
                    className="d-block py-1"
                    to={{
                      pathname: `/thread/${privateThreads[threadId].type}/${privateThreads[threadId].slug}`,
                    }}
                  >
                    <p
                      className={
                        "mb-0 pl-3" +
                        (!isLightMode ||
                        process.env.REACT_APP_PLATFORM == "web" ||
                        process.platform != "darwin"
                          ? " text-light"
                          : " text-dark")
                      }
                    >
                      {privateThreads[threadId].users.length == 1 && (
                        <FontAwesomeIcon
                          icon={faCircle}
                          className="mr-1"
                          style={{
                            color: organizationUsersOnline.includes(
                              privateThreads[threadId].users[0].id
                            )
                              ? "#3ecf8e"
                              : "#f9426c",
                            fontSize: ".5rem",
                            verticalAlign: "middle",
                          }}
                        />
                      )}
                      {privateThreads[threadId].display_name}
                    </p>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    } catch (error) {
      console.log(error);

      Object.keys(privateThreads).map((thread) => {
        console.log("THREAD", thread);
      });
    }

    var firstRoom = {};
    try {
      teams.forEach((team) => {
        if (team.rooms.length > 0) {
          team.rooms.forEach((room) => {
            firstRoom = {
              slug: room.slug,
              team: team,
              room: room,
            };
          });
        }
      });
    } catch (error) {
      //silently fail
    }

    try {
      if (organization != null && organization.name.length > 19) {
        organization.name = organization.name.slice(0, 18);
        organization.name = organization.name.trim() + "...";
      }
    } catch (error) {
      //silently fail
    }

    if (isMobile) {
      return (
        <Row>
          <Col xs={12}>
            <h1 className="text-center px-5 pt-5" style={{ color: "#fff" }}>
              Oops!
            </h1>
            <p className="lead text-center px-5" style={{ color: "#fff" }}>
              Blab is not optimized for mobile yet. Please try again from a
              desktop browser.
            </p>
            <center>
              <FontAwesomeIcon
                icon={faDesktop}
                className="pt-4"
                style={{ color: "#3ecf8e", fontSize: "8rem" }}
              />
            </center>
          </Col>
        </Row>
      );
    }

    return (
      <div
        style={{
          backgroundColor:
            process.env.REACT_APP_PLATFORM == "web" ||
            process.platform != "darwin"
              ? "#121422"
              : "transparent",
        }}
      >
        <Switch>
          <EnsureLoggedInContainer>
            <ErrorBoundary showError={false}>
              <InviteUsersModal
                show={showInviteUsersModal}
                handleSubmit={inviteUsers}
                loading={organizationLoading.toString()}
                inviteuserssuccess={inviteUsersSuccess}
                organizationusers={organizationUsers}
                billing={billing}
                onHide={() => this.setState({ showInviteUsersModal: false })}
              />
              <ManageUsersModal
                users={organizationUsers}
                loading={organizationLoading.toString()}
                show={showManageUsersModal}
                onShow={() => getOrganizationUsers(organization.id)}
                onHide={() => this.setState({ showManageUsersModal: false })}
              />
              <RoomsModal
                show={showRoomsModal}
                loading={organizationLoading.toString()}
                billing={billing}
                createroomsuccess={createRoomSuccess}
                lastCreatedRoomSlug={lastCreatedRoomSlug}
                roomsModalReset={roomsModalReset}
                handleSubmit={createRoom}
                push={push}
                onHide={() => this.setState({ showRoomsModal: false })}
              />
              <NewCallModal
                userId={user.id}
                users={organizationUsers}
                show={showCallsModal}
                loading={organizationLoading.toString()}
                createroomsuccess={createRoomSuccess}
                lastCreatedRoomSlug={lastCreatedRoomSlug}
                roomsModalReset={roomsModalReset}
                handleSubmit={createCall}
                push={push}
                onShow={() => getOrganizationUsers(organization.id)}
                onHide={() => this.setState({ showCallsModal: false })}
              />
              <IncomingCallModal
                call={incomingCall}
                show={showIncomingCallModal}
                handleIncomingCall={this.handleIncomingCall}
                onHide={() => this.setState({ showIncomingCallModal: false })}
              />
              <ManageCameraModal
                show={showManageCameraModal}
                settings={settings}
                handleSubmit={updateDefaultDevices}
                onShow={() => getAvailableDevices()}
                onHide={() => this.setState({ showManageCameraModal: false })}
              />
              <RoomSettingsModal
                show={showRoomSettingsModal}
                settings={settings}
                updateRoomSettings={updateRoomSettings}
                onHide={() => this.setState({ showRoomSettingsModal: false })}
              />
              <SettingsModal
                show={showSettingsModal}
                handleShowModal={this.handleShowModal}
                handleLogOut={() => this.userLogout()}
                organization={organization}
                onHide={() => this.setState({ showSettingsModal: false })}
              />
              <ExperimentalSettingsModal
                show={showExperimentalSettingsModal}
                settings={settings}
                updateExperimentalSettings={updateExperimentalSettings}
                onHide={() =>
                  this.setState({ showExperimentalSettingsModal: false })
                }
              />
            </ErrorBoundary>
            {process.env.REACT_APP_PLATFORM == "web" && (
              <Row
                style={{
                  height: 30,
                  color: "#fff",
                }}
              >
                <p className="font-weight-bold mx-auto text-center">
                  For the best experience,{" "}
                  <a
                    href="https://updater.blab.to"
                    target="_blank"
                    className="font-weight-bold"
                  >
                    download the Blab desktop app.
                  </a>
                </p>
              </Row>
            )}
            <Row>
              <Navbar
                className="pr-0 sidebar"
                expand={false}
                expanded={sidebarIsVisible}
                onToggle={() =>
                  this.setState({
                    sidebarIsVisible: sidebarIsVisible ? false : true,
                  })
                }
                style={{
                  height:
                    process.env.REACT_APP_PLATFORM == "web"
                      ? "calc(100vh - 30px)"
                      : "calc(100vh - 22px)",
                }}
              >
                <Navbar.Collapse id="responsive-navbar-nav">
                  <Navbar
                    className={!isLightMode && "text-light"}
                    style={{
                      height: 70,
                      backgroundColor:
                        process.env.REACT_APP_PLATFORM == "web" ||
                        process.platform != "darwin"
                          ? "#121422"
                          : "transparent",
                      borderBottom:
                        process.env.REACT_APP_PLATFORM == "web" ||
                        process.platform != "darwin"
                          ? "1px solid #1c2046"
                          : 0,
                    }}
                  >
                    <ErrorBoundary showError={false}>
                      <Navbar.Brand>
                        {organization != null ? (
                          <p
                            className={
                              "p-0 m-0" +
                              (!isLightMode ||
                              process.env.REACT_APP_PLATFORM == "web" ||
                              process.platform != "darwin"
                                ? " text-light"
                                : " text-dark")
                            }
                            style={{ fontSize: ".9rem", fontWeight: 800 }}
                          >
                            {organization.name}
                          </p>
                        ) : (
                          ""
                        )}
                        {user != null ? (
                          <p
                            className={
                              "pt-0 pb-1" +
                              (!isLightMode ||
                              process.env.REACT_APP_PLATFORM == "web" ||
                              process.platform != "darwin"
                                ? " text-light"
                                : " text-dark")
                            }
                            style={{ fontSize: ".8rem" }}
                          >
                            <FontAwesomeIcon
                              icon={faCircle}
                              className="mr-1"
                              style={{
                                color: "#3ecf8e",
                                fontSize: ".4rem",
                                verticalAlign: "middle",
                              }}
                            />{" "}
                            {user.first_name}
                          </p>
                        ) : (
                          ""
                        )}
                      </Navbar.Brand>
                    </ErrorBoundary>
                  </Navbar>
                  <div className="sidebar-scroll" style={{ minWidth: 200 }}>
                    <div>
                      <ul className="nav flex-column mt-1">
                        {billing.plan == "Free" && (
                          <li
                            key="upgrade-account-nav-button"
                            className="nav-item"
                          >
                            <a
                              className="d-block py-1"
                              href="https://blab.to/billing"
                              target="_blank"
                            >
                              <p className="mb-0 pl-3 text-red">
                                <FontAwesomeIcon
                                  icon={faArrowUp}
                                  style={{
                                    fontSize: ".7rem",
                                    marginRight: ".2rem",
                                  }}
                                />{" "}
                                Upgrade Account
                              </p>
                            </a>
                          </li>
                        )}
                        <li key="public-blabs-nav-button" className="nav-item">
                          <NavLink
                            exact={true}
                            activeStyle={{
                              fontWeight: "bold",
                            }}
                            className="d-block py-1"
                            to={{
                              pathname: `/library`,
                            }}
                          >
                            <p
                              className={
                                "mb-0 pl-3" +
                                (!isLightMode ||
                                process.env.REACT_APP_PLATFORM == "web" ||
                                process.platform != "darwin"
                                  ? " text-light"
                                  : " text-dark")
                              }
                            >
                              <FontAwesomeIcon
                                icon={faBookOpen}
                                style={{
                                  fontSize: ".7rem",
                                  marginRight: ".2rem",
                                }}
                              />{" "}
                              Library
                            </p>
                          </NavLink>
                        </li>
                        <li key="people-nav-button" className="nav-item">
                          <NavLink
                            exact={true}
                            activeStyle={{
                              fontWeight: "bold",
                            }}
                            className="d-block py-1"
                            to={{
                              pathname: `/team`,
                            }}
                          >
                            <p
                              className={
                                "mb-0 pl-3" +
                                (!isLightMode ||
                                process.env.REACT_APP_PLATFORM == "web" ||
                                process.platform != "darwin"
                                  ? " text-light"
                                  : " text-dark")
                              }
                            >
                              <FontAwesomeIcon
                                icon={faUsers}
                                style={{ fontSize: ".65rem" }}
                              />{" "}
                              Team
                            </p>
                          </NavLink>
                        </li>
                        <li key="settings-nav-button" className="nav-item">
                          <Button
                            variant="link"
                            className={
                              "mb-0 pl-3 d-block py-1" +
                              (!isLightMode ||
                              process.env.REACT_APP_PLATFORM == "web" ||
                              process.platform != "darwin"
                                ? " text-light"
                                : " text-dark")
                            }
                            onClick={() =>
                              this.setState({ showSettingsModal: true })
                            }
                          >
                            <FontAwesomeIcon
                              icon={faCog}
                              style={{ fontSize: ".65rem" }}
                            />{" "}
                            Settings
                          </Button>
                        </li>
                      </ul>
                    </div>
                    <div>
                      {sidebarPrivateThreads}
                      {rooms}
                    </div>
                  </div>
                </Navbar.Collapse>
                <Navbar.Toggle
                  aria-controls="responsive-navbar-nav"
                  className="border-0"
                  style={{ outline: "none" }}
                >
                  <FontAwesomeIcon
                    icon={
                      sidebarIsVisible
                        ? faChevronCircleLeft
                        : faChevronCircleRight
                    }
                    className="mr-1"
                    style={{ color: "#3ecf8e" }}
                  />
                </Navbar.Toggle>
              </Navbar>
              <Col
                className={"pl-0 shadow-sm" + (isLightMode ? "" : " dark-mode")}
                style={{
                  border: isLightMode
                    ? "1px solid rgb(28, 32, 70, .2)"
                    : "1px solid rgb(1, 1, 1, .35)",
                  width: "100%",
                  borderRadius: 15,
                  marginLeft: 0,
                  marginRight: 0,
                  marginTop: 0,
                  marginBottom: 20,
                  backgroundColor: isLightMode ? "#fff" : "#212529",
                  height:
                    process.env.REACT_APP_PLATFORM == "web"
                      ? "calc(100vh - 30px)"
                      : "calc(100vh - 22px)",
                }}
              >
                <>
                  <Route
                    path={routes.ROOM}
                    render={(routeProps) => (
                      <ErrorBoundary showError={true}>
                        <RoomPage
                          {...routeProps}
                          pusherInstance={pusherInstance}
                          userPrivateNotificationChannel={
                            userPrivateNotificationChannel
                          }
                          key={routeProps.match.params.roomSlug}
                          currentTime={currentTime}
                          backgroundBlurWindow={backgroundBlurWindow}
                          faceTrackingNetWindow={faceTrackingNetWindow}
                          sidebarIsVisible={sidebarIsVisible}
                          isLightMode={isLightMode}
                          onClick={() => {
                            if (window.innerWidth < 768) {
                              this.setState({
                                sidebarIsVisible: sidebarIsVisible
                                  ? false
                                  : true,
                              });
                            }
                          }}
                        />
                      </ErrorBoundary>
                    )}
                  />
                  <Route
                    path={routes.CALL}
                    render={(routeProps) => (
                      <ErrorBoundary showError={true}>
                        <RoomPage
                          {...routeProps}
                          sidebarIsVisible={sidebarIsVisible}
                          pusherInstance={pusherInstance}
                          userPrivateNotificationChannel={
                            userPrivateNotificationChannel
                          }
                          key={routeProps.match.params.roomSlug}
                          currentTime={currentTime}
                        />
                      </ErrorBoundary>
                    )}
                  />
                  <Route
                    path={routes.TEAM}
                    render={(routeProps) => (
                      <ErrorBoundary showError={true}>
                        <TeamPage
                          {...routeProps}
                          organizationUsersOnline={organizationUsersOnline}
                          currentTime={currentTime}
                          isLightMode={isLightMode}
                          onClick={() => {
                            if (window.innerWidth < 768) {
                              this.setState({
                                sidebarIsVisible: sidebarIsVisible
                                  ? false
                                  : true,
                              });
                            }
                          }}
                        />
                      </ErrorBoundary>
                    )}
                  />
                  <Route
                    path={routes.LIBRARY}
                    render={(routeProps) => (
                      <ErrorBoundary showError={true}>
                        <LibraryPage
                          {...routeProps}
                          isLightMode={isLightMode}
                          onClick={() => {
                            if (window.innerWidth < 768) {
                              this.setState({
                                sidebarIsVisible: sidebarIsVisible
                                  ? false
                                  : true,
                              });
                            }
                          }}
                        />
                      </ErrorBoundary>
                    )}
                  />
                  <Route
                    path={routes.MESSAGE.NEW}
                    render={(routeProps) => (
                      <ErrorBoundary showError={true}>
                        <NewMessagePage
                          {...routeProps}
                          isLightMode={isLightMode}
                          onClick={() => {
                            if (window.innerWidth < 768) {
                              this.setState({
                                sidebarIsVisible: sidebarIsVisible
                                  ? false
                                  : true,
                              });
                            }
                          }}
                        />
                      </ErrorBoundary>
                    )}
                  />
                  <Route
                    path={routes.MESSAGE.THREAD}
                    render={(routeProps) => (
                      <ErrorBoundary showError={true}>
                        <MessageThreadPage
                          isLightMode={isLightMode}
                          {...routeProps}
                          onClick={() => {
                            if (window.innerWidth < 768) {
                              this.setState({
                                sidebarIsVisible: sidebarIsVisible
                                  ? false
                                  : true,
                              });
                            }
                          }}
                        />
                      </ErrorBoundary>
                    )}
                  />
                </>
              </Col>
            </Row>
          </EnsureLoggedInContainer>
        </Switch>
      </div>
    );
  }
}

export default Sidebar;
