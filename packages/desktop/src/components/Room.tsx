/* eslint-disable @typescript-eslint/no-var-requires */
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import { BlazeFaceModel, load } from "@tensorflow-models/blazeface";
import { Button, Container, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsFromRedux } from "../containers/RoomPage";
import {
  Publisher,
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
  useToggleVideoAudioStatus,
} from "../hooks/room";
import { RouteComponentProps } from "react-router";
import { Routes } from "./RootComponent";
import { THROW, getBoundingCircle, mix } from "../workers/videoCroppingHelpers";
import { VideoCropping } from "../workers/videoCropping";
import {
  faArrowLeft,
  faCircleNotch,
  faLock,
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
} from "@fortawesome/free-solid-svg-icons";

import { ipcRenderer } from "electron";

import AddUserToRoomModal from "./AddUserToRoomModal";
import AudioList from "./AudioList";
import Pusher, { Channel } from "pusher-js";
import React, { useCallback, useEffect, useState } from "react";
import ScreenSharingModal from "./ScreenSharingModal";
import VideoList from "./VideoList";
import hark, { Harker } from "hark";
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

  const [windowIsExpanded, setWindowIsExpanded] = useState(false);

  const [showAddUserToRoomModal, setShowAddUserToRoomModal] = useState(false);
  const [showScreenSharingModal, setShowScreenSharingModal] = useState(false);
  const [showScreenSharingDropdown, setShowScreenSharingDropdown] = useState(
    false,
  );

  const [newPublishers, setNewPublishers] = useState<Publisher[]>([]);
  const [publishersToRemove, setPublishersToRemove] = useState<string[]>([]);

  //needed so the startPublishingStream(); effect doesn't run constantly
  const [startPublishingCalled, setStartPublishingCalled] = useState(false);
  const [mounted, setMounted] = useState(true);

  const [blazeModel, setBlazeModel] = useState<BlazeFaceModel | undefined>();

  useEffect(() => {
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    const loadNet = async () => {
      const net = await load({
        maxFaces: 1,
      });

      setBlazeModel(net);
    };

    loadNet();
  }, []);

  const {
    localVideoContainer,
    localVideoCanvasContainer,
    localVideoCanvas,
    backgroundBlurVideoCanvasCopy,
    localVideo,
  } = useCreateVideoContainers();

  const { setHeartbeatInterval } = useCreateHeartbeatIntervals();

  const [speechEventsListener, setSpeechEventsListener] = useState<
    Harker | undefined
  >();
  const [speakingPublishers, setSpeakingPublishers] = useState<string[]>([]);
  const [streamToPublish, setStreamToPublish] = useState<
    MediaStream | undefined
  >();

  const [hasVideoPublishers, setHasVideoPublishers] = useState(false);
  const [hasAudioPublishers, setHasAudioPublishers] = useState(false);

  const { room, presenceChannel, setPresenceChannel } = useInitializeRoom(
    roomSlug,
    teams,
    pusherInstance,
    user.id,
  );

  const [videoCroppingWorker, setVideoCroppingWorker] = useState<
    VideoCropping | undefined
  >();
  const [videoCroppingInterval, setVideoCroppingInterval] = useState<
    NodeJS.Timeout | undefined
  >();

  useEffect(() => {
    if (room && !room.video_enabled && videoStatus) {
      setVideoStatus(false);
    }
  }, [room, videoStatus]);

  /*useEffect(() => {
    const startVideoCroppingWorker = async () => {
      const videoCroppingWorker = await spawn<VideoCropping>(
        new Worker("../workers/videoCropping"),
      );
      setVideoCroppingWorker(videoCroppingWorker);
    };

    startVideoCroppingWorker();
  }, []);*/

  useEffect(() => {
    return () => {
      if (videoCroppingInterval) {
        clearInterval(videoCroppingInterval);
      }
    };
  }, [videoCroppingInterval]);

  /*useEffect(() => {
    const startWorker = async () => {
      const bodyPixWorker = await spawn(new Worker("../workers/bodyPix"));
      setBodyPixWorker(bodyPixWorker);
    };

    startWorker();
  }, []);*/

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
    streamToPublish,
    videoStatus,
    audioStatus,
    publishers,
    setPublishers,
    videoRoomStreamHandle,
    user?.id.toString(),
  );

  const publishersWithMembersData = useAddMemberDataToPublishers(
    publishers,
    members,
  );

  const videoSizes = useGetVideoSizes(
    showChatThread,
    publishersWithMembersData,
  );

  const updatePublishers = (updatedPublishers: Publisher[]) => {
    setNewPublishers(updatedPublishers);
  };

  useEffect(() => {
    if (newPublishers.length > 0) {
      const currentPublisherIds = publishers.map((publisher) => publisher.id);
      const uniqueNewPublishers = newPublishers.filter(
        (publisher) => !currentPublisherIds.includes(publisher.id),
      );

      setNewPublishers([]);
      setPublishers([...publishers, ...uniqueNewPublishers]);
    }
  }, [newPublishers, publishers]);

  const removePublisher = (publisherIdToRemove: string) => {
    setPublishersToRemove([...publishersToRemove, publisherIdToRemove]);
  };

  useEffect(() => {
    if (publishersToRemove.length > 0) {
      const updatedPublishers = publishers.filter(
        (publisher) => !publishersToRemove.includes(publisher.id),
      );
      setPublishersToRemove([]);
      setPublishers(updatedPublishers);
    }
  }, [publishersToRemove, publishers]);

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

        if (msg.publishers) {
          updatePublishers(msg.publishers);
        }

        if (msg.videoroom === "event") {
          if (msg.leaving || msg.unpublished) {
            const msgToCheck = msg.leaving ?? msg.unpublished;
            if (msgToCheck) {
              removePublisher(msgToCheck);
            }
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

  const networkOnline = useOnlineListener();
  useEffect(() => {
    if (networkOnline) {
      reconnectNetworkConnections();
    } else {
      disconnectNetworkConnections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkOnline]);

  useEffect(() => {
    const startStream = async () => {
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
    };

    const stopStream = () => {
      if (!rawLocalStream) return;
      rawLocalStream.getTracks().forEach((track) => track.stop());
    };

    if (!rawLocalStream && networkOnline) {
      startStream();
    }

    if (rawLocalStream && !networkOnline) {
      stopStream();
    }

    return () => {
      if (rawLocalStream) {
        stopStream();
      }
    };
  }, [rawLocalStream, settings.defaultDevices, networkOnline]);

  const handleRemoteStreams = useCallback(() => {
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
            dataMsg.requesting_publisher_id !== user.id
          ) {
            return;
          }

          const updatedPublishers = publishers.map((publisher) => {
            if (publisher.member?.id.toString() === dataMsg.publisher_id) {
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

                setSpeakingPublishers([
                  ...new Set([...speakingPublishers, publisher.id.toString()]),
                ]);
              }

              if (dataMsg.type === "stopped_speaking") {
                publisher.speaking = false;

                const updatedSpeakingPublishers = speakingPublishers.filter(
                  (speakingId) => speakingId !== publisher.id.toString(),
                );
                setSpeakingPublishers(updatedSpeakingPublishers);
              }

              if (dataMsg.type === "participant_status_update") {
                publisher.hasAudio = dataMsg.audio_status;
                publisher.hasVideo = dataMsg.video_status;
                publisher.videoIsFaceOnly = dataMsg.face_only_status;
              }
            }

            return publisher;
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
  }, [
    audioStatus,
    peerUuid,
    privateId,
    publishers,
    room?.channel_id,
    rootMediaHandle,
    speakingPublishers,
    streamerKey,
    user,
    videoRoomStreamHandle,
    videoStatus,
  ]);

  useEffect(() => {
    if (publishing) {
      handleRemoteStreams();
    }
  }, [publishing, publishers, handleRemoteStreams]);

  useEffect(() => {
    if (rootMediaHandleInitialized && videoRoomStreamHandle === undefined) {
      getVideoRoomStreamHandle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootMediaHandleInitialized, videoRoomStreamHandle]);

  useEffect(() => {
    if (
      !streamToPublish ||
      speechEventsListener ||
      videoRoomStreamHandle === undefined
    )
      return;
    const speechEvents = hark(streamToPublish);

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

    setSpeechEventsListener(speechEvents);
  }, [
    speakingPublishers,
    streamToPublish,
    user.id,
    videoRoomStreamHandle,
    speechEventsListener,
  ]);

  useEffect(() => {
    return () => {
      if (speechEventsListener) {
        speechEventsListener.stop();
      }
    };
  }, [speechEventsListener]);

  const startPublishingStream = useCallback(async () => {
    setStartPublishingCalled(true);

    let publishingStarted = false;

    if (!user || !streamToPublish) {
      return;
    }

    //publish our feed
    videoRoomStreamHandle.createOffer({
      stream: streamToPublish,
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

        const isCurrentPublisher = publishers.find(
          (publisher) => publisher.id === user.id.toString(),
        );

        if (!isCurrentPublisher && peerUuid) {
          setNewPublishers([
            ...newPublishers,
            {
              hasVideo: videoStatus,
              hasAudio: audioStatus,
              id: user?.id.toString(),
              stream: streamToPublish,
              active: true,
              display: peerUuid,
              member: currentWebsocketUser,
            },
          ]);
        }

        publishingStarted = true;

        setPublishing(publishingStarted);

        const heartbeatInterval = setInterval(() => {
          const dataMsg = {
            type: "participant_status_update",
            publisher_id: user.id,
            video_status: videoStatus,
            audio_status: audioStatus,
            face_only_status: false,
          };

          videoRoomStreamHandle.data({
            text: JSON.stringify(dataMsg),
          });
        }, 30000);

        setHeartbeatInterval(heartbeatInterval);
      },
    });
  }, [
    audioStatus,
    currentWebsocketUser,
    newPublishers,
    peerUuid,
    publishers,
    setHeartbeatInterval,
    streamToPublish,
    user,
    videoRoomStreamHandle,
    videoStatus,
  ]);

  const [startStreamCalled, setStartStreamCalled] = useState(false);

  useEffect(() => {
    //move all of the stream creation logic here, then only call start publishing
    //stream once it's ready
    if (
      !rawLocalStream ||
      startStreamCalled ||
      !localVideoCanvas ||
      !localVideo ||
      !blazeModel
    )
      return;

    setStartStreamCalled(true);

    const streamToPublish = localVideoCanvas.captureStream(60);

    rawLocalStream
      .getAudioTracks()
      .forEach((track) => streamToPublish.addTrack(track));

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
      const avgBoundingBoxCenter = [0, 0];
      let avgBoundingBoxRadius = 50;
      let latestBoundingBox = [0, 0, 50, 50];

      localVideoCanvas.width = 400;
      localVideoCanvas.height = 400;

      const mainCtx = localVideoCanvas.getContext("2d");

      const videoCroppingInterval = setInterval(async () => {
        const prediction = await blazeModel.estimateFaces(localVideo, false);

        if (prediction && prediction[0].landmarks) {
          const {
            boundingCircleCenter,
            boundingCircleRadius,
          } = getBoundingCircle(prediction[0]);

          avgBoundingBoxCenter[0] = mix(
            THROW,
            avgBoundingBoxCenter[0],
            boundingCircleCenter[0],
          );
          avgBoundingBoxCenter[1] = mix(
            THROW,
            avgBoundingBoxCenter[1],
            boundingCircleCenter[1],
          );
          avgBoundingBoxRadius = mix(
            THROW,
            avgBoundingBoxRadius,
            boundingCircleRadius,
          );

          const updatedBoundingBox = [
            avgBoundingBoxCenter[0] - avgBoundingBoxRadius,
            avgBoundingBoxCenter[1] - avgBoundingBoxRadius,
            avgBoundingBoxRadius * 2,
            avgBoundingBoxRadius * 2,
          ];

          if (
            Math.abs(updatedBoundingBox[0] - latestBoundingBox[0]) > 10 ||
            Math.abs(updatedBoundingBox[1] - latestBoundingBox[1]) > 10
          ) {
            latestBoundingBox = updatedBoundingBox;
          }
        }
      }, 100);

      setVideoCroppingInterval(videoCroppingInterval);

      const getNextFrame = async () => {
        if (!mounted) return;
        if (!mainCtx) {
          requestAnimationFrame(getNextFrame);
          return;
        }

        mainCtx.fillStyle = "rgba(0, 0, 0, 1)";
        mainCtx.fillRect(0, 0, 400, 400);

        mainCtx.drawImage(
          localVideo,
          latestBoundingBox[0],
          latestBoundingBox[1],
          latestBoundingBox[2],
          latestBoundingBox[3],
          0,
          0,
          400,
          400,
        );

        requestAnimationFrame(getNextFrame);
        return;
      };

      getNextFrame();
      setStreamToPublish(streamToPublish);
    };
  }, [
    rawLocalStream,
    localVideo,
    localVideoCanvas,
    backgroundBlurVideoCanvasCopy,
    videoCroppingWorker,
    mounted,
    startStreamCalled,
    blazeModel,
  ]);

  useEffect(() => {
    if (props.match.path === "/call/:roomSlug") {
      setIsCall(true);
    }
  }, [props.match.path]);

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
    if (
      rootMediaHandleInitialized &&
      joinedMediaHandle &&
      rawLocalStream &&
      streamToPublish &&
      !startPublishingCalled
    ) {
      startPublishingStream();
    }
  }, [
    rootMediaHandleInitialized,
    joinedMediaHandle,
    startPublishingCalled,
    startPublishingStream,
    rawLocalStream,
    streamToPublish,
  ]);

  useEffect(() => {
    if (publishing) {
      setLoading(false);
    }
  }, [publishing]);

  useEffect(() => {
    return () => {
      if (room?.video_enabled && process.env.NODE_ENV !== "development") {
        ipcRenderer.invoke("update-main-window-width", {
          type: "sidebar",
        });
      }
    };
  }, [room?.video_enabled]);

  useEffect(() => {
    const hasVideoPublishers = publishers.filter(
      (publisher) => publisher.hasVideo,
    );

    const hasAudioPublishers = publishers.filter(
      (publisher) => !publisher.hasVideo,
    );

    setHasAudioPublishers(Boolean(hasAudioPublishers.length > 0));
    setHasVideoPublishers(Boolean(hasVideoPublishers.length > 0));
  }, [publishers]);

  useEffect(() => {
    if (
      hasVideoPublishers &&
      !windowIsExpanded &&
      process.env.NODE_ENV !== "development"
    ) {
      ipcRenderer.invoke("update-main-window-width", {
        type: "full",
      });

      setWindowIsExpanded(true);
    }

    if (
      !hasVideoPublishers &&
      windowIsExpanded &&
      process.env.NODE_ENV !== "development"
    ) {
      ipcRenderer.invoke("update-main-window-width", {
        type: "sidebar",
      });

      setWindowIsExpanded(false);
    }
  }, [hasVideoPublishers, windowIsExpanded]);

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
      <Header>
        <HeaderContent>
          <FontAwesomeIcon
            icon={faArrowLeft}
            style={{ color: "#f9426c", cursor: "pointer" }}
            onClick={() => props.push(Routes.Home)}
          />
          <Title>{room?.name}</Title>

          {room?.is_private && (
            <RoomPrivacyContainer>
              <OverlayTrigger
                placement="bottom-start"
                overlay={
                  <Tooltip id="tooltip-view-members">
                    View current members of this private room and add new ones.
                  </Tooltip>
                }
              >
                <span className="d-inline-block">
                  <Button
                    variant="link"
                    className="pt-0 pl-1"
                    style={{ fontSize: ".7rem" }}
                    onClick={() => setShowAddUserToRoomModal(true)}
                  >
                    <FontAwesomeIcon icon={faLock} />{" "}
                    {roomUsers.length > 0 ? roomUsers.length : ""}
                  </Button>
                </span>
              </OverlayTrigger>
            </RoomPrivacyContainer>
          )}
          <RoomControlsContainer>
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
            {!billing.video_enabled && room?.video_enabled && (
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
            )}

            {billing.video_enabled && room?.video_enabled && (
              <Button
                variant="link"
                className={
                  "mx-3 icon-button btn-lg ph-no-capture" +
                  (videoStatus ? " text-green" : " text-red")
                }
                onClick={() => setVideoStatus(!videoStatus)}
              >
                <FontAwesomeIcon icon={videoStatus ? faVideo : faVideoSlash} />
              </Button>
            )}
          </RoomControlsContainer>
        </HeaderContent>
      </Header>
      <Container
        className="ml-0 stage-container"
        fluid
        style={{ height: "calc('100vh - 140px')" }}
      >
        {loading && (
          <LoadingContainer>
            <LoadingMessage>Loading Room</LoadingMessage>

            <FontAwesomeIcon
              icon={faCircleNotch}
              style={{ fontSize: "1.4rem", color: "#6772ef" }}
              spin
            />
          </LoadingContainer>
        )}
        <Stage>
          <AudioContainer
            hasAudioPublishers={hasAudioPublishers}
            hasVideoPublishers={hasVideoPublishers}
          >
            {!loading &&
              !roomAtCapacity &&
              publishersWithMembersData.length > 0 &&
              hasAudioPublishers && (
                <AudioList
                  publishers={publishersWithMembersData}
                  publishing={publishing}
                  speakingPublishers={speakingPublishers}
                  hasVideoPublishers={hasVideoPublishers}
                  user={user}
                ></AudioList>
              )}
          </AudioContainer>
          {!loading &&
            !roomAtCapacity &&
            publishersWithMembersData.length > 0 &&
            hasVideoPublishers && (
              <VideoContainer
                hasVideoPublishers={hasVideoPublishers}
                hasAudioPublishers={hasAudioPublishers}
              >
                <VideoList
                  videoSizes={videoSizes}
                  publishers={publishersWithMembersData}
                  publishing={publishing}
                  user={user}
                  togglePinned={(publisherId: string) =>
                    setPinnedPublisherIdId(publisherId)
                  }
                  pinnedPublisherId={pinnedPublisherId}
                  speakingPublishers={speakingPublishers}
                ></VideoList>
              </VideoContainer>
            )}
        </Stage>

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

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
`;

const LoadingMessage = styled.div`
  font-size: 22px;
  font-weight: 600;
  color: #fff;
  text-align: center;
  margin-bottom: 10px;
`;

const Header = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  border-bottom: 1.5px solid rgb(255, 255, 255, 0.3);
  user-select: none;
  margin-top: 10px;
  margin-bottom: 15px;
`;

const HeaderContent = styled.div`
  margin-left: 12px;
  display: flex;
  align-items: center;
  width: 100%;
`;

const RoomPrivacyContainer = styled.div`
  margin-left: 8px;
  color: #fff;

  svg {
    color: #fff;
  }
`;

const RoomControlsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const Title = styled.div`
  font-size: 16px;
  margin-left: 12px;
  font-weight: 600;
  color: #fff;
`;

const Stage = styled.div`
  display: flex;
`;

const AudioContainer = styled.div<{
  hasVideoPublishers: boolean;
  hasAudioPublishers: boolean;
}>`
  border-right: ${(props) =>
    props.hasVideoPublishers && props.hasAudioPublishers
      ? "2px solid rgb(0, 0, 0, 0.15)"
      : undefined};
  padding-right: ${(props) =>
    props.hasVideoPublishers && props.hasAudioPublishers ? "24px" : undefined};
  align-content: center;
  align-items: center;
  width: ${(props) => (props.hasVideoPublishers ? undefined : "100%")};
`;

const VideoContainer = styled.div<{
  hasVideoPublishers: boolean;
  hasAudioPublishers: boolean;
}>`
  justify-content: center;
  width: 100%;
  padding: ${(props) =>
    props.hasVideoPublishers && props.hasAudioPublishers ? "24px" : undefined};
`;
