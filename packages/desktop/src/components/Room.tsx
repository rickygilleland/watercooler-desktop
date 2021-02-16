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
import { Janus } from "janus-gateway";
import { PropsFromRedux } from "../containers/RoomPage";
import { Room as RoomType } from "../store/types/room";
import { RouteComponentProps } from "react-router";
import { Team } from "../store/types/organization";
import { User } from "../store/types/user";
import { clone, each } from "lodash";
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
  useGetRootMediaHandle,
  useGetVideoSizes,
  useInitializeJanus,
  useOnlineListener,
  useRenderVideo,
  useResizeListener,
  useStartPublishingStream,
} from "../hooks/room";
import AddUserToRoomModal from "./AddUserToRoomModal";
import Pusher, { Channel, Members, PresenceChannel } from "pusher-js";
import React, { useCallback, useEffect, useState } from "react";

import ScreenSharingModal from "./ScreenSharingModal";
import VideoList from "./VideoList";
import hark from "hark";
import posthog from "posthog-js";
import styled from "styled-components";
const bodyPix = require("@tensorflow-models/body-pix");
const { BrowserWindow } = require("electron").remote;
const { ipcRenderer } = require("electron");
const { desktopCapturer } = require("electron");
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
    getRoomUsers,
    pusherInstance,
    match,
    roomSlug,
    user,
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
  const [room, setRoom] = useState<RoomType | undefined>();
  const [team, setTeam] = useState<Team | undefined>();
  const [presenceChannel, setPresenceChannel] = useState<Channel | undefined>();
  const [showChatThread] = useState(false);
  const [rawLocalStream, setRawLocalStream] = useState<
    MediaStream | undefined
  >();

  const {
    availableScreensToShare,
    screensourcesLoading,
  } = useGetAvailableScreensToShare();

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
  }, [pusherInstance, room?.channel_id]);

  const disconnectNetworkConnections = useCallback(() => {
    if (presenceChannel) {
      presenceChannel.unbind();
      setPresenceChannel(undefined);
    }

    if (publishing) {
      stopPublishingStream();
    }
  }, [presenceChannel, publishing]);

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
    let updatedRoom: RoomType | undefined;
    let updatedTeam: Team | undefined;

    if (typeof roomSlug === "undefined") {
      setRoom(updatedRoom);
      setTeam(updatedTeam);
      return;
    }

    for (const team of teams) {
      updatedRoom = team.rooms.find((teamRoom) => teamRoom.slug === roomSlug);
      if (updatedRoom) {
        updatedTeam = team;
        break;
      }
    }

    setRoom(updatedRoom);
    setTeam(updatedTeam);

    if (!updatedRoom) {
      return;
    }

    posthog.capture("$pageview", { room_id: updatedRoom.id });

    getRoomUsers(updatedRoom.id);

    const presenceChannel = pusherInstance.subscribe(
      `presence-room.${updatedRoom.channel_id}`,
    );

    setPresenceChannel(presenceChannel);
  }, [
    teams,
    roomSlug,
    getRoomUsers,
    pusherInstance,
    props.user.id,
    getNewServer,
  ]);

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

  const stopPublishingStream = () => {
    const {
      videoRoomStreamHandle,
      screenSharingHandle,
      screenSharingStream,
      screenSharingWindow,
      local_stream,
      localVideoContainer,
      localVideoCanvasContainer,
      publishers,
      me,
      heartbeatInterval,
      backgroundBlurEnabled,
      videoIsFaceOnly,
    } = this.state;

    if (videoRoomStreamHandle == null) {
      return;
    }

    const request = {
      request: "unpublish",
    };

    videoRoomStreamHandle.send({ message: request });

    if (screenSharingHandle != null) {
      screenSharingHandle.send({ message: request });

      if (screenSharingStream != null) {
        const screenSharingTracks = screenSharingStream.getTracks();

        screenSharingTracks.forEach(function (track: { stop: () => void }) {
          track.stop();
        });
      }
    }

    if (screenSharingWindow != null) {
      screenSharingWindow.destroy();
    }

    if (local_stream != null) {
      const tracks = local_stream.getTracks();

      tracks.forEach(function (track: { stop: () => void }) {
        track.stop();
      });
    }

    if (typeof localVideoContainer != "undefined") {
      localVideoContainer.remove();
    }

    if (typeof localVideoCanvasContainer != "undefined") {
      localVideoCanvasContainer.remove();
    }

    if (backgroundBlurEnabled) {
      this.stopBackgroundBlur();
    }

    let updatedPublishers = [...publishers];

    updatedPublishers = updatedPublishers.filter((publisher) => {
      if (typeof publisher.handle != "undefined" && publisher.handle != null) {
        publisher.handle.detach();
      }

      publisher.handle = null;
      publisher.active = false;
      publisher.stream = null;

      return publisher.member.id != me.id;
    });

    if (process.env.REACT_APP_PLATFORM != "web") {
      ipcRenderer.invoke("update-tray-icon", {
        disable: true,
      });
    }

    if (heartbeatInterval != null) {
      clearInterval(heartbeatInterval);
    }

    this.setState({
      publishing: false,
      local_stream: null,
      publishers: updatedPublishers,
      screenSharingActive: false,
      screenSharingWindow: null,
      heartbeatInterval: null,
    });
  };

  useEffect(() => {
    ipcRenderer.on("update-screen-sharing-controls", (_event, args) => {
      if (typeof args.toggleVideoOrAudio !== "undefined") {
        return toggleVideoOrAudio(args.toggleVideoOrAudio);
      }

      if (typeof args.toggleScreenSharing !== "undefined") {
        if (
          typeof args.entireScreen !== "undefined" &&
          args.toggleScreenSharing == true
        ) {
          return toggleScreenSharing("entire-screen");
        }
        return toggleScreenSharing();
      }

      if (typeof args.leaveRoom !== "undefined") {
        return stopPublishingStream();
      }

      ipcRenderer.invoke("update-screen-sharing-controls", {
        videoStatus: videoStatus,
        audioStatus: audioStatus,
        videoEnabled: room?.video_enabled,
        screenSharingWindow: screenSharingWindow?.id,
      });

      ipcRenderer.invoke("update-tray-icon", {
        videoStatus: videoStatus,
        audioStatus: audioStatus,
        videoEnabled: room?.video_enabled,
        screenSharingActive: screenSharingActive,
      });
    });

    return () => {
      ipcRenderer.removeAllListeners("update-screen-sharing-controls");
    };
  });

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

    const that = this;

    screenSharingHandle.createOffer({
      stream: screenSharingStream,
      media: { screenshareFrameRate: 30 },
      success: function (jsep: any) {
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
            videoStatus: that.state.videoStatus,
            audioStatus: that.state.audioStatus,
            videoEnabled: that.state.room.video_enabled,
            screenSharingActive: true,
          });

          that.setState({ screenSharingActive: true, screenSharingWindow });
        });
      },
    });
  };

  return null;
}
