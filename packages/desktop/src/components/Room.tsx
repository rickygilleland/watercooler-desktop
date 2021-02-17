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
import {
  Publisher,
  useAddLocalUserToPublishers,
  useAddMemberDataToPublishers,
  useBindPresenceChannelEvents,
  useCreateHeartbeatIntervals,
  useCreateVideoContainers,
  useGetAvailableScreensToShare,
  useGetRoomUsers,
  useGetRootMediaHandle,
  useGetVideoSizes,
  useInitializeJanus,
  useInitializeRoom,
  useOnlineListener,
  useResizeListener,
  useToggleVideoAudioStatus,
} from "../hooks/room";
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
import AddUserToRoomModal from "./AddUserToRoomModal";
import Pusher, { Channel } from "pusher-js";
import React, { useCallback, useEffect, useState } from "react";
import hark from "hark";

import ScreenSharingModal from "./ScreenSharingModal";
import VideoList from "./VideoList";
import styled from "styled-components";

interface RoomProps extends PropsFromRedux, RouteComponentProps {
  pusherInstance: Pusher | undefined;
  userPrivateNotificationChannel: Channel | undefined;
  isLightMode: boolean;
  roomSlug: string | undefined;
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
    settings.roomSettings.videoEnabled && billing.video_enabled,
  );
  const [audioStatus, setAudioStatus] = useState(
    settings.roomSettings.audioEnabled,
  );
  const [screenSharingActive, setScreenSharingActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showChatThread] = useState(false);
  const [rawLocalStream, setRawLocalStream] = useState<
    MediaStream | undefined
  >();
  const [pinnedPublisherId, setPinnedPublisherIdId] = useState<
    string | undefined
  >();
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [videoRoomStreamHandle, setVideoRoomStreamHandle] = useState<any>();
  const [joinedMediaHandle, setJoinedMediaHandle] = useState(false);
  const [mediaHandleError, setMediaHandleError] = useState(false);
  const [privateId, setPrivateId] = useState<string | undefined>();
  const [publishing, setPublishing] = useState(false);

  const [showAddUserToRoomModal, setShowAddUserToRoomModal] = useState(false);
  const [showScreenSharingModal, setShowScreenSharingModal] = useState(false);
  const [showScreenSharingDropdown, setShowScreenSharingDropdown] = useState(
    false,
  );

  const {
    localVideoContainer,
    localVideoCanvasContainer,
    localVideoCanvas,
    backgroundBlurVideoCanvasCopy,
    localVideo,
  } = useCreateVideoContainers();

  const {
    heartbeatInterval,
    setHeartbeatInterval,
  } = useCreateHeartbeatIntervals();

  const [speakingPublishers, setSpeakingPublishers] = useState<string[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | undefined>();

  const { room, presenceChannel, setPresenceChannel } = useInitializeRoom(
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

  useToggleVideoAudioStatus(
    localStream,
    videoStatus,
    audioStatus,
    publishers,
    setPublishers,
    videoRoomStreamHandle,
    user?.id.toString(),
  );

  useAddLocalUserToPublishers(
    publishing,
    audioStatus,
    videoStatus,
    currentWebsocketUser,
    localStream,
    publishers,
    setPublishers,
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
    publishersWithMembersData.length,
  );

  const getVideoRoomStreamHandle = () => {
    if (!room) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let handle: any;

    rootMediaHandle.attach({
      plugin: "janus.plugin.videoroom",
      opaqueId: peerUuid,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      success: function (videoRoomStreamHandle: any) {
        handle = videoRoomStreamHandle;
        setVideoRoomStreamHandle(videoRoomStreamHandle);

        //register a publisher
        const request = {
          request: "join",
          room: room.channel_id,
          ptype: "publisher",
          display: peerUuid,
          token: streamerKey,
          pin: roomPin,
        };

        handle.send({ message: request });
      },
      error: function () {
        setMediaHandleError(true);
      },
      onmessage: function (
        msg: {
          videoroom: string;
          private_id: string;
          publishers?: Publisher[];
          leaving?: string;
          unpublished?: string;
        },
        jsep: string,
      ) {
        if (jsep != null) {
          handle.handleRemoteJsep({ jsep: jsep });
        }

        if (msg.videoroom === "joined") {
          setPrivateId(msg.private_id);
          setJoinedMediaHandle(true);
        }

        if (msg.videoroom === "event") {
          //check if we have new publishers to subscribe to
          if (msg.publishers) {
            setPublishers(msg.publishers);
          }

          if (msg.leaving || msg.unpublished) {
            const msgToCheck = msg.leaving ?? msg.unpublished;

            const updatedPublishers = publishers.filter(
              (publisher) => publisher.id !== msgToCheck,
            );
            setPublishers(updatedPublishers);
          }
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      ondataopen: function () {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      ondata: function () {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      slowLink: function () {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      mediaState: function () {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      webrtcState: function () {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      iceState: function () {},
      oncleanup: function () {
        // PeerConnection with the plugin closed, clean the UI
        // The plugin handle is still valid so we can create a new one
      },
      detached: function () {
        // Connection with the plugin closed, get rid of its features
        // The plugin handle is not valid anymore
        setVideoRoomStreamHandle(undefined);
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      destroyed: function () {
        setVideoRoomStreamHandle(undefined);
      },
    });
  };

  useEffect(() => {
    if (rootMediaHandleInitialized && videoRoomStreamHandle === undefined) {
      getVideoRoomStreamHandle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootMediaHandleInitialized, videoRoomStreamHandle]);

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

    const handleRemoteStreams = () => {
      if (!user) {
        return;
      }
      const unsubscribedRemotePublishers = publishers.filter(
        (publisher) =>
          publisher.id !== user.id.toString() && !publisher.subscribed,
      );

      for (const publisher of unsubscribedRemotePublishers) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let handle: any;

        rootMediaHandle.attach({
          plugin: "janus.plugin.videoroom",
          opaqueId: peerUuid,
          success: function (remoteHandle: {
            send: (arg0: {
              message: {
                request: string;
                room: string;
                ptype: string;
                display: string;
                token: string;
                feed: string;
                private_id: string;
              };
            }) => void;
          }) {
            if (room?.channel_id && peerUuid && streamerKey && privateId) {
              //subscribe to the feed
              const request = {
                request: "join",
                room: room.channel_id,
                ptype: "subscriber",
                display: peerUuid,
                token: streamerKey,
                feed: publisher.id,
                private_id: privateId,
              };

              handle = remoteHandle;

              remoteHandle.send({ message: request });
            }
          },
          error: function () {
            //
          },
          onmessage: function (
            msg: { display?: string; room: string },
            jsep?: string,
          ) {
            if (jsep != null && msg.display) {
              handle.createAnswer({
                jsep: jsep,
                media: { audioSend: false, videoSend: false, data: true },
                success: function (jsep: string) {
                  const request = {
                    request: "start",
                    room: msg.room,
                  };

                  handle.send({ message: request, jsep: jsep });
                },
              });
            }
          },
          onremotestream: function (remote_stream: MediaStream) {
            const updatedPublishers = publishers.map((publisherToUpdate) => {
              if (publisherToUpdate.display === publisher.display) {
                publisherToUpdate.stream = remote_stream;
                publisherToUpdate.hasVideo = publisher.id.includes(
                  "_screensharing",
                );
                publisherToUpdate.hasAudio = true;
                publisherToUpdate.active = true;
                publisherToUpdate.subscribed = true;
              }

              return publisherToUpdate;
            });

            setPublishers(updatedPublishers);
          },
          ondataopen: function () {
            const dataMsg = {
              type: "initial_video_audio_status",
              publisher_id: user.id.toString(),
              video_status: videoStatus,
              audio_status: audioStatus,
              face_only_status: false,
            };

            setTimeout(() => {
              videoRoomStreamHandle.data({
                text: JSON.stringify(dataMsg),
              });
            }, 1000);
          },
          ondata: function (data: string) {
            const dataMsg = JSON.parse(data);

            if (
              dataMsg.type === "initial_video_audio_status_response" &&
              dataMsg.requesting_publisher_id !== user.id.toString()
            ) {
              return;
            }

            const updatedPublishers = [...publishers];

            updatedPublishers.forEach((publisher) => {
              if (publisher.member?.id == dataMsg.publisher_id) {
                if (dataMsg.type === "audio_toggled") {
                  publisher.hasAudio = dataMsg.audio_status;
                }

                if (dataMsg.type === "video_toggled") {
                  publisher.hasVideo = dataMsg.video_status;
                }

                if (dataMsg.type === "face_only_status_toggled") {
                  publisher.videoIsFaceOnly = dataMsg.face_only_status;
                }

                if (dataMsg.type === "initial_video_audio_status") {
                  publisher.hasAudio = dataMsg.audio_status;
                  publisher.hasVideo = dataMsg.video_status;
                  publisher.videoIsFaceOnly = dataMsg.face_only_status;
                }

                if (dataMsg.type === "started_speaking") {
                  publisher.speaking = true;
                }

                if (dataMsg.type === "stopped_speaking") {
                  publisher.speaking = false;
                }

                if (dataMsg.type === "participant_status_update") {
                  publisher.hasAudio = dataMsg.audio_status;
                  publisher.hasVideo = dataMsg.video_status;
                  publisher.videoIsFaceOnly = dataMsg.face_only_status;
                }
              }
            });

            if (dataMsg.type === "initial_video_audio_status" && user) {
              const dataMsgResponse = {
                type: "initial_video_audio_status_response",
                publisher_id: user.id.toString(),
                requesting_publisher_id: dataMsg.publisher_id,
                video_status: videoStatus,
                audio_status: audioStatus,
                face_only_status: false,
              };

              videoRoomStreamHandle.data({
                text: JSON.stringify(dataMsgResponse),
              });
            }

            setPublishers(updatedPublishers);
          },
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          slowLink: function () {},
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          mediaState: function () {},
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          oncleanup: function () {},
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          detached: function () {},
        });
      }
    };

    const publishStream = async () => {
      if (!user) {
        return;
      }

      const localStream = localVideoCanvas.captureStream(60);

      rawLocalStream
        .getAudioTracks()
        .forEach((track) => localStream.addTrack(track));

      const speechEvents = hark(localStream);

      speechEvents.on("speaking", function () {
        setSpeakingPublishers([
          ...new Set([...speakingPublishers, user.id.toString()]),
        ]);

        const dataMsg = {
          type: "started_speaking",
          publisher_id: user.id,
        };

        videoRoomStreamHandle.data({
          text: JSON.stringify(dataMsg),
        });
      });

      speechEvents.on("stopped_speaking", function () {
        const dataMsg = {
          type: "stopped_speaking",
          publisher_id: user.id,
        };

        videoRoomStreamHandle.data({
          text: JSON.stringify(dataMsg),
        });

        const updatedSpeakingPublishers = speakingPublishers.filter(
          (speakingId) => speakingId !== user.id.toString(),
        );
        setSpeakingPublishers(updatedSpeakingPublishers);
      });

      //publish our feed
      videoRoomStreamHandle.createOffer({
        stream: localStream,
        media: {
          audioRecv: false,
          videoRecv: false,
          audioSend: true,
          videoSend: true,
          data: true,
        },
        success: function (jsep: string) {
          const request = {
            request: "publish",
            audio: true,
            video: true,
            data: true,
          };

          videoRoomStreamHandle.send({ message: request, jsep: jsep });

          setPublishing(true);
          setLocalStream(localStream);

          handleRemoteStreams();
        },
      });
    };

    localVideo.srcObject = rawLocalStream;
    localVideo.muted = true;
    localVideo.autoplay = true;
    localVideo.setAttribute("playsinline", "");
    localVideo.play();

    localVideo.onloadedmetadata = () => {
      if (localVideo) {
        localVideo.width = localVideo.videoWidth;
        localVideo.height = localVideo.videoHeight;
      }
    };

    localVideo.onplaying = async () => {
      publishStream();
    };

    setRawLocalStream(rawLocalStream);
  }, [
    audioStatus,
    localVideo,
    localVideoCanvas,
    peerUuid,
    privateId,
    publishers,
    room?.channel_id,
    rootMediaHandle,
    setPublishers,
    settings.defaultDevices,
    speakingPublishers,
    streamerKey,
    user,
    videoRoomStreamHandle,
    videoStatus,
  ]);

  const stopPublishingStream = () => {
    const request = {
      request: "unpublish",
    };

    videoRoomStreamHandle.send({ message: request });

    localStream?.getTracks()?.forEach((track) => track.stop());

    for (const publisher of publishers) {
      if (publisher.active) {
        publisher.handle.detach();
      }
    }

    setPublishers([]);
    setPublishing(false);
  };

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
    if (!room?.channel_id || !pusherInstance) {
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
      setPublishing(false);
    }
  }, [presenceChannel, publishing, setPresenceChannel, setPublishing]);

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

  useEffect(() => {
    if (rootMediaHandleInitialized && joinedMediaHandle) {
      setLoading(false);
    }
  }, [rootMediaHandleInitialized, joinedMediaHandle]);

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
        handleSubmit={() => {
          //
        }}
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
                        onClick={() => setShowAddUserToRoomModal(true)}
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
              {!isCall && !loading && !localStream && (
                <Button
                  variant="link"
                  style={{ whiteSpace: "nowrap" }}
                  className="mx-3 icon-button btn-lg"
                  size="lg"
                  disabled={roomAtCapacity}
                  onClick={() => startPublishingStream()}
                >
                  <FontAwesomeIcon icon={faDoorOpen} /> Join
                </Button>
              )}
              {!isCall && !loading && localStream && (
                <Button
                  variant="link"
                  style={{ whiteSpace: "nowrap" }}
                  className="mx-3 icon-button btn-lg text-red"
                  size="lg"
                  onClick={() => stopPublishingStream()}
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
                {!billing.video_enabled ||
                process.env.REACT_APP_PLATFORM == "web" ? (
                  <OverlayTrigger
                    placement="bottom-start"
                    overlay={
                      <Tooltip id="tooltip-disabled">
                        {process.env.REACT_APP_PLATFORM == "web"
                          ? "Screen sharing is only available in the Blab desktop app"
                          : "Screen sharing is not enabled for your organization."}
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
                    onClick={() => {
                      //
                    }}
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
                          onClick={() => {
                            //
                          }}
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
                {!billing.video_enabled ? (
                  <OverlayTrigger
                    placement="bottom-start"
                    overlay={
                      <Tooltip id="tooltip-disabled">
                        Video is not enabled for your organization.
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
              </div>
              <div style={{ height: 60 }}></div>
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
        {loading && (
          <div style={{ overflowY: "scroll" }}>
            <LoadingMessage>Loading Room...</LoadingMessage>
            <Center>
              <FontAwesomeIcon
                icon={faCircleNotch}
                className="mt-3"
                style={{ fontSize: "2.4rem", color: "#6772ef" }}
                spin
              />
            </Center>
          </div>
        )}
        {!loading &&
          !roomAtCapacity &&
          publishersWithMembersData.length > 0 && (
            <VideoList
              videoSizes={videoSizes}
              publishers={publishersWithMembersData}
              publishing={publishing}
              user={user}
              togglePinned={(publisherId: string) =>
                setPinnedPublisherIdId(publisherId)
              }
              pinnedPublisherId={pinnedPublisherId}
            ></VideoList>
          )}
        {!loading && roomAtCapacity && (
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

const LoadingMessage = styled.div`
  margin: auto;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`;
