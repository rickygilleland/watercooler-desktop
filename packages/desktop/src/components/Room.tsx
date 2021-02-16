/* eslint-disable @typescript-eslint/no-var-requires */
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import {
  Button,
  Col,
  Container,
  Dropdown,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsFromRedux } from "../containers/RoomPage";
import { RouteComponentProps } from "react-router";
import {
  faCircleNotch,
  faDesktop,
  faDoorClosed,
  faDoorOpen,
  faLock,
  faMicrophone,
  faMicrophoneSlash,
  faUser,
  faVideo,
  faVideoSlash,
  faWindowMaximize,
} from "@fortawesome/free-solid-svg-icons";
import {
  useAddMemberDataToPublishers,
  useBindPresenceChannelEvents,
  useGetAvailableScreensToShare,
  useGetMediaHandle,
  useGetRoomUsers,
  useGetRootMediaHandle,
  useGetVideoSizes,
  useInitializeJanus,
  useInitializeRoom,
  useOnlineListener,
  useResizeListener,
  useStartPublishingStream,
} from "../hooks/room";
import AddUserToRoomModal from "./AddUserToRoomModal";
import Pusher, { PresenceChannel } from "pusher-js";
import React, { useCallback, useEffect, useState } from "react";

import ScreenSharingModal from "./ScreenSharingModal";
import VideoList from "./VideoList";
import posthog from "posthog-js";
import styled from "styled-components";
const { BrowserWindow } = require("electron").remote;
const { ipcRenderer } = require("electron");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let MAIN_WINDOW_WEBPACK_ENTRY: any;

interface RoomProps extends PropsFromRedux, RouteComponentProps {
  pusherInstance: Pusher;
  userPrivateNotificationChannel: PresenceChannel;
  sidebarIsVisible: boolean;
  isLightMode: boolean;
  onClick(): void;
}

export default function Room(props: RoomProps): JSX.Element {
  const {
    settings,
    billing,
    teams,
    pusherInstance,
    roomSlug,
    user,
    organizationUsers,
    roomLoading,
    addUserLoading,
    addUserToRoom,
  } = props;

  const [isCall, setIsCall] = useState(false);
  const [videoStatus, setVideoStatus] = useState(
    settings.roomSettings.videoEnabled && billing.plan == "Plus",
  );
  const [audioStatus, setAudioStatus] = useState(
    settings.roomSettings.audioEnabled,
  );
  const [screenSharingWindow, setScreenSharingWindow] = useState<
    Electron.BrowserWindow | undefined
  >();
  const [screenSharingActive, setScreenSharingActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showChatThread] = useState(false);
  const [rawLocalStream, setRawLocalStream] = useState<
    MediaStream | undefined
  >();

  const [showAddUserToRoomModal, setShowAddUserToRoomModal] = useState(false);
  const [showScreenSharingModal, setShowScreenSharingModal] = useState(false);
  const [showScreenSharingDropdown, setShowScreenSharingDropdown] = useState(
    false,
  );

  const { room, team, presenceChannel, setPresenceChannel } = useInitializeRoom(
    roomSlug,
    teams,
    pusherInstance,
    user.id,
  );

  const {
    availableScreensToShare,
    screenSourcesLoading,
  } = useGetAvailableScreensToShare(showScreenSharingModal);

  const roomUsers = useGetRoomUsers(room?.id, props.auth.authKey);

  const janusInitialized = useInitializeJanus();

  const {
    roomAtCapacity,
    members,
    mediaServer,
    peerUuid,
    streamerKey,
    roomPin,
    roomServerUpdated,
    currentWebsocketUser,
  } = useBindPresenceChannelEvents(presenceChannel, room?.id, user?.id);
  const { rootMediaHandle, rootMediaHandleInitialized } = useGetRootMediaHandle(
    mediaServer,
    janusInitialized,
  );

  const {
    localStream,
    speakingPublishers,
    publishing,
  } = useStartPublishingStream(
    rawLocalStream,
    rootMediaHandle,
    user.id.toString(),
    videoStatus,
    audioStatus,
  );

  const {
    videoRoomStreamHandle,
    publishers,
    mediaHandleError,
    privateId,
    joinedMediaHandle,
  } = useGetMediaHandle(
    rootMediaHandle,
    rootMediaHandleInitialized,
    room?.channel_id,
    peerUuid,
    streamerKey,
    roomPin,
    publishing,
    currentWebsocketUser,
    audioStatus,
    videoStatus,
    localStream,
    user.id.toString(),
  );

  const publishersWithMembersData = useAddMemberDataToPublishers(
    publishers,
    members,
    speakingPublishers,
  );

  const dimensions = useResizeListener();
  const videoSizes = useGetVideoSizes(
    dimensions,
    showChatThread,
    publishers.length,
  );

  const startPublishingStream = useCallback(async () => {
    let streamOptions;
    /* TODO: Manually prompt for camera and microphone access on macos to handle it more gracefully - systemPreferences.getMediaAccessStatus(mediaType) */
    if (
      settings.defaultDevices != null &&
      Object.keys(settings.defaultDevices).length !== 0
    ) {
      streamOptions = {
        video: {
          aspectRatio: 1.3333333333,
          deviceId: settings.defaultDevices.videoInput,
        },
        audio: {
          deviceId: settings.defaultDevices.audioInput,
        },
      };
    } else {
      streamOptions = {
        video: {
          aspectRatio: 1.3333333333,
        },
        audio: true,
      };
    }

    const rawLocalStream = await navigator.mediaDevices.getUserMedia(
      streamOptions,
    );

    setRawLocalStream(rawLocalStream);
  }, [settings.defaultDevices]);

  useEffect(() => {
    if (props.match.path === "/call/:roomSlug") {
      setIsCall(true);
    }
  }, [props.match.path]);

  const networkOnline = useOnlineListener();
  useEffect(() => {
    if (networkOnline) {
      reconnectNetworkConnections();
    } else {
      disconnectNetworkConnections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkOnline]);

  const reconnectNetworkConnections = useCallback(() => {
    if (!room?.channel_id) {
      return;
    }

    const presenceChannel = pusherInstance.subscribe(
      `presence-room.${room.channel_id}`,
    );
    setPresenceChannel(presenceChannel);
  }, [pusherInstance, room?.channel_id, setPresenceChannel]);

  const disconnectNetworkConnections = useCallback(() => {
    if (presenceChannel) {
      presenceChannel.unbind();
      setPresenceChannel(undefined);
    }

    if (publishing) {
      stopPublishingStream();
    }
  }, [presenceChannel, publishing, setPresenceChannel]);

  const getNewServer = useCallback(() => {
    disconnectNetworkConnections();
    reconnectNetworkConnections();

    if (publishing) {
      startPublishingStream();
    }
  }, [
    disconnectNetworkConnections,
    publishing,
    reconnectNetworkConnections,
    startPublishingStream,
  ]);

  useEffect(() => {
    if (roomServerUpdated) {
      getNewServer();
    }
  }, [getNewServer, roomServerUpdated]);

  useEffect(() => {
    if (rawLocalStream) {
      rawLocalStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = videoStatus));
      rawLocalStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = audioStatus));
    }

    return () => {
      if (rawLocalStream) {
        rawLocalStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [audioStatus, rawLocalStream, videoStatus]);

  const toggleScreenSharing = async (streamId?: string) => {
    const {
      screenSharingHandle,
      screenSharingActive,
      screenSources,
      screenSharingStream,
      screenSharingWindow,
      room,
    } = this.state;

    if (screenSharingActive && streamId == null) {
      const request = {
        request: "unpublish",
      };

      if (screenSharingHandle != null) {
        screenSharingHandle.send({ message: request });
      }

      if (screenSharingStream != null) {
        const screenSharingTracks = screenSharingStream.getTracks();

        screenSharingTracks.forEach(function (track: { stop: () => void }) {
          track.stop();
        });
      }

      if (screenSharingWindow != null) {
        screenSharingWindow.destroy();
      }

      ipcRenderer.invoke("update-tray-icon", {
        videoStatus: this.state.videoStatus,
        audioStatus: this.state.audioStatus,
        videoEnabled: this.state.room.video_enabled,
        screenSharingActive: false,
      });

      posthog.capture("screen-sharing-stopped", { room_id: room.id });

      return this.setState({
        screenSharingActive: false,
        screenSharingStream: null,
        screenSharingWindow: null,
      });
    }

    let entireScreen = false;

    if (streamId == "entire-screen") {
      entireScreen = true;

      ipcRenderer
        .invoke("get-media-access-status", { mediaType: "screen" })
        .then((response) => {
          if (response == "denied") {
            return this.setState({ screenSharingError: true });
          }
        });

      screenSources.forEach((source: { name: string; id: any }) => {
        if (source.name == "Entire Screen") {
          streamId = source.id;
        }
      });
    }

    posthog.capture("screen-sharing-started", {
      room_id: room.id,
      "entire-screen": entireScreen,
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: streamId,
          },
        },
      });

      this.setState({ screenSharingStream: stream, screenSharingError: false });

      this.startPublishingScreenSharingStream();
    } catch (e) {
      //show an error
    }
  };

  const startPublishingScreenSharingStream = () => {
    const { screenSharingHandle, screenSharingStream } = this.state;

    if (screenSharingHandle == null) {
      return this.openScreenSharingHandle();
    }

    screenSharingHandle.createOffer({
      stream: screenSharingStream,
      media: { screenshareFrameRate: 30 },
      success: function (jsep: string) {
        const request = {
          request: "publish",
          audio: false,
          video: true,
        };

        screenSharingHandle.send({ message: request, jsep: jsep });

        ipcRenderer.invoke("get-current-window-dimensions").then((result) => {
          const x = 0;
          const y = Math.round(result.height - result.height / 2 - 150);

          const screenSharingWindow = new BrowserWindow({
            width: 45,
            height: 185,
            x,
            y,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            hasShadow: false,
            resizable: false,
            paintWhenInitiallyHidden: false,
            focusable: false,
            acceptFirstMouse: true,
            webPreferences: {
              nodeIntegration: true,
              preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
              devTools: false,
            },
          });

          screenSharingWindow.setVisibleOnAllWorkspaces(true);

          screenSharingWindow.loadURL(
            MAIN_WINDOW_WEBPACK_ENTRY + "#/screensharing_controls",
          );

          ipcRenderer.invoke("update-screen-sharing-controls", {
            starting: true,
          });

          ipcRenderer.invoke("update-tray-icon", {
            videoStatus: videoStatus,
            audioStatus: audioStatus,
            videoEnabled: room?.video_enabled,
            screenSharingActive: true,
          });

          setScreenSharingActive(true);
          setScreenSharingWindow(screenSharingWindow);
        });
      },
    });
  };

  return (
    <React.Fragment>
      {showAddUserToRoomModal && room && currentWebsocketUser && (
        <AddUserToRoomModal
          users={roomUsers}
          organizationUsers={organizationUsers}
          me={currentWebsocketUser}
          room={room}
          loading={roomLoading}
          addUserLoading={addUserLoading}
          show={showAddUserToRoomModal}
          handleSubmit={addUserToRoom}
          onHide={() => setShowAddUserToRoomModal(false)}
        />
      )}
      <ScreenSharingModal
        sources={availableScreensToShare}
        show={showScreenSharingModal}
        loading={screenSourcesLoading}
        handleSubmit={this.toggleScreenSharing}
        onHide={() => setShowScreenSharingModal(false)}
      />
      <Row
        className="pl-0 ml-0 w-100"
        style={{ minHeight: 60, maxHeight: 120 }}
      >
        <Col xs={{ span: 8 }} md={{ span: 5 }}>
          <div className="d-flex flex-row justify-content-start">
            <div className="align-self-center">
              <p
                style={{ fontWeight: "bolder", fontSize: "1.4rem" }}
                className="pb-0 mb-0"
              >
                {room?.name}
              </p>
              {room?.is_private ? (
                <React.Fragment>
                  <FontAwesomeIcon
                    icon={faLock}
                    style={{
                      fontSize: ".7rem",
                      marginRight: ".3rem",
                      marginBottom: 3,
                    }}
                  />
                  <OverlayTrigger
                    placement="bottom-start"
                    overlay={
                      <Tooltip id="tooltip-view-members">
                        View current members of this private room and add new
                        ones.
                      </Tooltip>
                    }
                  >
                    <span className="d-inline-block">
                      <Button
                        variant="link"
                        className="pt-0 pl-1"
                        style={{ color: "black", fontSize: ".7rem" }}
                        onClick={() =>
                          this.setState({ showAddUserToRoomModal: true })
                        }
                      >
                        <FontAwesomeIcon icon={faUser} />{" "}
                        {roomUsers.length > 0 ? roomUsers.length : ""}
                      </Button>
                    </span>
                  </OverlayTrigger>
                </React.Fragment>
              ) : (
                /*<OverlayTrigger placement="bottom-start" overlay={<Tooltip id="tooltip-view-members">This room is visible to everyone on your team.</Tooltip>}>
                                  <span className="d-inline-block">
                                  <Button variant="link" className="pl-0 pt-0" style={{color:"black",fontSize:".7rem", pointerEvents: 'none'}}><FontAwesomeIcon icon={faUser} /></Button>
                                  </span>
                              </OverlayTrigger>*/ ""
              )}
            </div>
            <div style={{ height: 60 }}></div>
          </div>
        </Col>
        <Col xs={{ span: 4 }} md={{ span: 2 }}>
          <div className="d-flex flex-row justify-content-center">
            <div className="align-self-center">
              {!isCall ? (
                loading ? (
                  ""
                ) : localStream === null ? (
                  !roomAtCapacity ? (
                    <Button
                      variant="link"
                      style={{ whiteSpace: "nowrap" }}
                      className="mx-3 icon-button btn-lg"
                      size="lg"
                      onClick={() => startPublishingStream()}
                    >
                      <FontAwesomeIcon icon={faDoorOpen} /> Join
                    </Button>
                  ) : (
                    <Button
                      variant="link"
                      style={{ whiteSpace: "nowrap" }}
                      className="mx-3 icon-button btn-lg"
                      size="lg"
                      disabled
                    >
                      <FontAwesomeIcon icon={faDoorOpen} /> Join
                    </Button>
                  )
                ) : (
                  <Button
                    variant="link"
                    style={{ whiteSpace: "nowrap" }}
                    className="mx-3 icon-button btn-lg text-red"
                    size="lg"
                    onClick={() => this.stopPublishingStream()}
                  >
                    <FontAwesomeIcon icon={faDoorClosed} /> Leave
                  </Button>
                )
              ) : loading || localStream === null ? (
                ""
              ) : (
                <Button
                  variant="link"
                  style={{ whiteSpace: "nowrap" }}
                  size="lg"
                  className="mx-3 icon-button btn-lg text-red"
                  onClick={() => this.stopPublishingStream()}
                >
                  <FontAwesomeIcon icon={faDoorClosed} /> Leave
                </Button>
              )}
            </div>
            <div style={{ height: 60 }}></div>
          </div>
        </Col>
        <Col xs={{ span: 12 }} md={{ span: 5 }} className="pr-0 mx-auto">
          {localStream ? (
            <div className="d-flex flex-row flex-nowrap justify-content-end">
              <div className="align-self-center pr-4">
                {billing.plan != "Plus" ||
                process.env.REACT_APP_PLATFORM == "web" ? (
                  <OverlayTrigger
                    placement="bottom-start"
                    overlay={
                      <Tooltip id="tooltip-disabled">
                        {process.env.REACT_APP_PLATFORM == "web"
                          ? "Screen sharing is only available in the Blab desktop app"
                          : "The Plus Plan is required for screen sharing."}
                      </Tooltip>
                    }
                  >
                    <span className="d-inline-block">
                      <Button
                        variant="link"
                        className="mx-3 icon-button btn-lg"
                        style={{ pointerEvents: "none" }}
                        disabled
                      >
                        <FontAwesomeIcon icon={faDesktop} />
                      </Button>
                    </span>
                  </OverlayTrigger>
                ) : screenSharingActive ? (
                  <Button
                    variant="link"
                    className="mx-3 icon-button btn-lg text-red"
                    onClick={() => this.toggleScreenSharing()}
                  >
                    <FontAwesomeIcon icon={faDesktop} />
                  </Button>
                ) : (
                  <Dropdown className="p-0 m-0" as="span">
                    <Dropdown.Toggle
                      variant="link"
                      id="screensharing-dropdown"
                      className="mx-3 no-carat icon-button btn-lg"
                    >
                      <FontAwesomeIcon icon={faDesktop} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu show={showScreenSharingDropdown}>
                      <Dropdown.Item className="no-hover-bg">
                        <Button
                          variant="info"
                          className="btn-block ph-no-capture"
                          onClick={() =>
                            this.toggleScreenSharing("entire-screen")
                          }
                        >
                          <FontAwesomeIcon icon={faDesktop} /> Share Whole
                          Screen
                        </Button>
                      </Dropdown.Item>
                      <Dropdown.Item className="no-hover-bg">
                        <Button
                          variant="info"
                          className="btn-block ph-no-capture"
                          onClick={() => {
                            setShowScreenSharingModal(true);
                            setShowScreenSharingDropdown(false);
                          }}
                        >
                          <FontAwesomeIcon icon={faWindowMaximize} /> Share a
                          Window
                        </Button>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
                <Button
                  variant="link"
                  className={
                    "mx-3 icon-button btn-lg ph-no-capture" +
                    (audioStatus ? " text-green" : " text-red")
                  }
                  onClick={() => setAudioStatus(!audioStatus)}
                >
                  <FontAwesomeIcon
                    icon={audioStatus ? faMicrophone : faMicrophoneSlash}
                  />
                </Button>
                {billing.plan != "Plus" ? (
                  <OverlayTrigger
                    placement="bottom-start"
                    overlay={
                      <Tooltip id="tooltip-disabled">
                        The Plus Plan is required for video.
                      </Tooltip>
                    }
                  >
                    <span className="d-inline-block">
                      <Button
                        variant="link"
                        className="mx-3 icon-button btn-lg ph-no-capture text-red"
                        disabled
                        style={{ pointerEvents: "none" }}
                      >
                        <FontAwesomeIcon
                          icon={videoStatus ? faVideo : faVideoSlash}
                        />
                      </Button>
                    </span>
                  </OverlayTrigger>
                ) : room?.video_enabled ? (
                  <React.Fragment>
                    <Button
                      variant="link"
                      className={
                        "mx-3 icon-button btn-lg ph-no-capture" +
                        (videoStatus ? " text-green" : " text-red")
                      }
                      onClick={() => setVideoStatus(!videoStatus)}
                    >
                      <FontAwesomeIcon
                        icon={videoStatus ? faVideo : faVideoSlash}
                      />
                    </Button>
                  </React.Fragment>
                ) : (
                  <OverlayTrigger
                    placement="bottom-start"
                    overlay={
                      <Tooltip id="tooltip-disabled">
                        Video is disabled in this room.
                      </Tooltip>
                    }
                  >
                    <span className="d-inline-block">
                      <Button
                        variant="link"
                        className="mx-3 icon-button btn-lg ph-no-capture text-red"
                        disabled
                        style={{ pointerEvents: "none" }}
                      >
                        <FontAwesomeIcon
                          icon={videoStatus ? faVideo : faVideoSlash}
                        />
                      </Button>
                    </span>
                  </OverlayTrigger>
                )}
                {/*
                                  <Dropdown className="p-0 m-0" as="span">
                                      <Dropdown.Toggle variant="info" id="more-settings-dropdown" className="mx-1 no-carat">
                                          <FontAwesomeIcon icon={faEllipsisV} />
                                      </Dropdown.Toggle>
                                      <Dropdown.Menu show={showMoreSettingsDropdown}>
                                          <Dropdown.Item className="no-hover-bg">
                                          {process.env.REACT_APP_PLATFORM == "web"
                                              ?
                                                  <OverlayTrigger placement="bottom-start" overlay={<Tooltip id="background-blur-disabled">Background Blur is only available on the Blab desktop app.</Tooltip>}>
                                                      <span className="d-inline-block">
                                                          <Button variant={backgroundBlurEnabled ? "danger" : "success"} className="mx-1 ph-no-capture" disabled={true} style={{ pointerEvents: 'none' }} block><FontAwesomeIcon icon={backgroundBlurEnabled ? faTint : faTintSlash} /> Background Blur Unavailable</Button>
                                                      </span>
                                                  </OverlayTrigger>
                                              :
                                                  <Button variant={backgroundBlurEnabled ? "danger" : "success"} className="mx-1 ph-no-capture" disabled={true} onClick={() => backgroundBlurEnabled ? this.stopBackgroundBlur() : this.startBackgroundBlur() } block><FontAwesomeIcon icon={backgroundBlurEnabled ? faTint : faTintSlash} /> {backgroundBlurEnabled ? 'Disable' : 'Enable' } Background Blur</Button>
                                          }
                                          </Dropdown.Item>
                                          <Dropdown.Item className="no-hover-bg">
                                              {settings.experimentalSettings.faceTracking ? <Button variant={videoIsFaceOnly ? "danger" : "success"} className="mx-1" disabled={true} onClick={() => this.setState({ videoIsFaceOnly: videoIsFaceOnly ? false : true }) } block><FontAwesomeIcon icon={faSmile} /> {videoIsFaceOnly ? 'Disable' : 'Enable' } Face Tracking</Button> : ''}
                                          </Dropdown.Item>
                                      </Dropdown.Menu>
                                  </Dropdown>
                                  */}
              </div>
              <div style={{ height: 60 }}></div>
              {/*<Button variant="light" className="mx-1" onClick={() => this.createDetachedWindow() }><FontAwesomeIcon icon={faLayerGroup}></FontAwesomeIcon></Button>*/}
            </div>
          ) : (
            ""
          )}
        </Col>
      </Row>
      <Container
        className="ml-0 stage-container"
        fluid
        style={{ height: videoSizes.containerHeight - 20 }}
      >
        {loading ? (
          <div style={{ overflowY: "scroll" }}>
            <h1 className="text-center mt-5">Loading Room...</h1>
            <Center>
              <FontAwesomeIcon
                icon={faCircleNotch}
                className="mt-3"
                style={{ fontSize: "2.4rem", color: "#6772ef" }}
                spin
              />
            </Center>
          </div>
        ) : !roomAtCapacity ? (
          <React.Fragment>
            <div className={videoSizes.display} style={{ overflowY: "scroll" }}>
              {publishers.length > 0 ? (
                <VideoList
                  videoSizes={videoSizes}
                  publishers={publishers}
                  publishing={publishing}
                  user={user}
                  togglePinned={this.togglePinned}
                  pinned={pinned}
                ></VideoList>
              ) : (
                currentLoadingMessage
              )}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <h1 className="text-center mt-5">Oops!</h1>
            <h2 className="text-center h3" style={{ fontWeight: 600 }}>
              This room is at capacity and cannot be joined.
            </h2>
            <p className="text-center h3" style={{ fontWeight: 500 }}>
              Free plans have a limit of 5 people in a room at a time.
            </p>
          </React.Fragment>
        )}
      </Container>
    </React.Fragment>
  );
}

const Center = styled.div`
  margin: 0 auto;
`;
