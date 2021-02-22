import { LibraryItem } from "../store/types/library";
import { Message } from "../store/types/message";
import { PropsFromRedux } from "../containers/RootContainer";
import { Room } from "../store/types/room";
import { Route, Switch } from "react-router-dom";
import { Team } from "../store/types/organization";
import { Thread } from "../store/types/thread";
import { User } from "../store/types/user";
import { each } from "lodash";
import EnsureLoggedInContainer from "../containers/EnsureLoggedInContainer";
import ErrorBoundary from "./ErrorBoundary";
import InviteUsersModal from "./InviteUsersModal";
import MainPage from "../containers/MainPage";
import ManageCameraModal from "./ManageCameraModal";
import ManageUsersModal from "./ManageUsersModal";
import Pusher, { Channel, Members } from "pusher-js";
import React, { useEffect, useState } from "react";
import RoomPage from "../containers/RoomPage";
import RoomSettingsModal from "./RoomSettingsModal";
import posthog from "posthog-js";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { nativeTheme } = require("electron").remote;

export enum Routes {
  Home = "/home",
  Room = "/room/:roomSlug",
  Call = "/call/:roomSlug",
  Login = "/login",
  MagicLogin = "/magic/login/:code",
  Callback = "/callback/:type/:code",
  Loading = "/loading",
  Redirect = "/redirect",
  Library = "/library",
  Team = "/team",
  MessageNew = "/messages/new",
  MessageAll = "/messages",
  MessagePublicThread = "/thread/public",
  MessageThread = "/thread/:type/:threadSlug",
  Upgrade = "/upgrade",
}

export default function RootComponent(props: PropsFromRedux): JSX.Element {
  const {
    organization,
    user,
    auth,
    teams,
    billing,
    settings,
    organizationUsers,
    organizationLoading,
    getOrganizations,
    getOrganizationUsers,
    addNewItemFromNotification,
    updateUserDetails,
  } = props;
  const [isLightMode, setIsLightMode] = useState(false);
  const [pusherInstance, setPusherInstance] = useState<Pusher>();
  const [
    organizationPresenceChannel,
    setOrganziationPresenceChannel,
  ] = useState<Channel>();
  const [userChannel, setUserChannel] = useState<Channel>();

  const [organizationUsersOnline, setOrganizationUsersOnline] = useState<
    number[]
  >([]);

  const [showInviteUsersModal, setShowInviteUsersModal] = useState(false);

  const [showRoomSettingsModal, setShowRoomSettingsModal] = useState(false);
  const [showManageUsersModal, setShowManageUsersModal] = useState(false);
  const [showManageCameraModal, setShowManageCameraModal] = useState(false);

  const [activeTeam, setActiveTeam] = useState<Team>();

  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);

  useEffect(() => {
    const fetchOrganizationUsers = async () => {
      await getOrganizationUsers(organization.id);
    };

    if (organization?.id !== undefined) {
      fetchOrganizationUsers();
    }
  }, [getOrganizationUsers, organization?.id]);

  useEffect(() => {
    nativeTheme.on("updated", () => {
      setIsLightMode(!nativeTheme.shouldUseDarkColors);
    });

    const pusherInstance = new Pusher("3eb4f9d419966b6e1e0b", {
      forceTLS: true,
      wsHost: "blab.to",
      httpHost: "blab.to",
      disableStats: true,
      wsPath: "/socket",
      httpPath: "/socket",
      wsPort: 443,
      authEndpoint: "https://blab.to/broadcasting/auth",
      authTransport: "ajax",
      auth: {
        headers: {
          Authorization: `Bearer ${auth.authKey}`,
          Accept: "application/json",
        },
      },
    });

    setPusherInstance(pusherInstance);

    return () => {
      pusherInstance.disconnect();
    };
  }, [auth.authKey]);

  useEffect(() => {
    if (user?.id === undefined) return;
    posthog.identify(user.id.toString());
    posthog.people.set({ email: user.email });

    posthog.register({
      organization_id: organization.id,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      version: require("electron").remote.app.getVersion(),
    });
  }, [user.id, user.email, organization.id]);

  useEffect(() => {
    if (user?.timezone === undefined) return;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (user.timezone != timezone) {
      updateUserDetails(timezone);
    }
  }, [user.timezone, updateUserDetails]);

  useEffect(() => {
    if (pusherInstance) {
      if (!organizationPresenceChannel) {
        const organizationPresenceChannel = pusherInstance.subscribe(
          `presence-organization.${organization.id}`,
        );

        setOrganziationPresenceChannel(organizationPresenceChannel);

        organizationPresenceChannel.bind_global(function (
          event: string,
          data: {
            members?: Members;
            me: {
              id: number;
            };
            myId: number;
            room?: Room;
            user?: User;
          },
        ) {
          if (event == "pusher:subscription_succeeded") {
            const organizationUsersOnline: number[] = [];

            each(data.members, (member: { id: number }) => {
              organizationUsersOnline.push(member.id);
            });

            setOrganizationUsersOnline(organizationUsersOnline);
          }

          if (event == "pusher:member_added") {
            setOrganizationUsersOnline([...organizationUsersOnline, data.myId]);
          }

          if (event == "pusher:member_removed") {
            const updatedOrganizationUsersOnline = organizationUsersOnline.filter(
              (userId) => userId !== data.myId,
            );
            setOrganizationUsersOnline(updatedOrganizationUsersOnline);
          }

          if (event == "billing.updated") {
            getOrganizations();
          }

          if (
            (event === "room.user.joined" || event === "room.user.joined") &&
            data.user?.id !== user.id
          ) {
            getOrganizationUsers(organization.id);
            getOrganizations();
          }
        });
      }

      if (!userChannel) {
        const userChannel = pusherInstance.subscribe(`private-user.${user.id}`);
        setUserChannel(userChannel);

        userChannel.bind_global(function (
          event: string,
          data: {
            id: number;
            thread?: Thread;
            message?: Message;
            item?: LibraryItem;
          },
        ) {
          if (event === "room.created" || event === "room.user.invited") {
            getOrganizations();
          }

          if (event === "library.items.updated" && data.item) {
            addNewItemFromNotification(data.item);
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pusherInstance, organization.id, user.id, organizationUsersOnline]);

  useEffect(() => {
    if (teams.length > 0) {
      const activeTeam = teams[0];

      activeTeam.name = activeTeam.name.slice(0, 16);
      activeTeam.name = activeTeam.name.trim() + "...";

      setActiveTeam(activeTeam);
    }
  }, [teams]);

  const handleUserLogout = () => {
    const { userLogout } = props;
    if (pusherInstance) {
      if (organizationPresenceChannel && organization.id) {
        pusherInstance.unsubscribe(`presence-room.${organization.id}`);
      }

      if (userChannel) {
        pusherInstance.unsubscribe(`private-user.${user.id}`);
      }

      pusherInstance.disconnect();
    }

    posthog.reset();

    userLogout();
    return;
  };

  return (
    <React.Fragment>
      <Switch>
        <EnsureLoggedInContainer currentURL={props.currentURL}>
          <ErrorBoundary showError={false}>
            {showInviteUsersModal && (
              <InviteUsersModal
                show={showInviteUsersModal}
                handleSubmit={props.inviteUsers}
                loading={organizationLoading}
                inviteuserssuccess={props.inviteUsersSuccess}
                organizationusers={organizationUsers}
                billing={billing}
                onHide={() => setShowInviteUsersModal(false)}
              />
            )}
            {showManageUsersModal && (
              <ManageUsersModal
                users={organizationUsers}
                loading={organizationLoading}
                show={showManageUsersModal}
                onShow={() => getOrganizationUsers(organization.id)}
                onHide={() => setShowManageUsersModal(false)}
              />
            )}
            {showManageCameraModal && (
              <ManageCameraModal
                show={showManageCameraModal}
                settings={settings}
                handleSubmit={props.updateDefaultDevices}
                onShow={() => props.getAvailableDevices()}
                onHide={() => setShowManageCameraModal(false)}
              />
            )}
            {showRoomSettingsModal && (
              <RoomSettingsModal
                show={showRoomSettingsModal}
                settings={settings}
                updateRoomSettings={props.updateRoomSettings}
                onHide={() => setShowRoomSettingsModal(false)}
              />
            )}
          </ErrorBoundary>

          <Route
            path={Routes.Room}
            render={(routeProps) => (
              <ErrorBoundary showError={true}>
                <RoomPage
                  {...routeProps}
                  pusherInstance={pusherInstance}
                  userPrivateNotificationChannel={userChannel}
                  key={routeProps.match.params.roomSlug}
                  isLightMode={isLightMode}
                  roomSlug={routeProps.match.params.roomSlug}
                />
              </ErrorBoundary>
            )}
          />
          <Route
            path={Routes.Home}
            render={(routeProps) => (
              <ErrorBoundary showError={true}>
                <MainPage
                  {...routeProps}
                  handleUserLogout={handleUserLogout}
                  isLightMode={isLightMode}
                  activeTeam={activeTeam}
                  organizationUsersOnline={organizationUsersOnline}
                  setShowInviteUsersModal={setShowInviteUsersModal}
                  showCreateRoomForm={showCreateRoomForm}
                  setShowCreateRoomForm={setShowCreateRoomForm}
                  setShowManageCameraModal={setShowManageCameraModal}
                  setShowRoomSettingsModal={setShowRoomSettingsModal}
                />
              </ErrorBoundary>
            )}
          />
        </EnsureLoggedInContainer>
      </Switch>
    </React.Fragment>
  );
}
