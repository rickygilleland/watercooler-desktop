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
  useGetAvailableScreensToShare,
  useInitializeJanus,
  useOnlineListener,
  useResizeListener,
} from "../hooks/room";
import AddUserToRoomModal from "./AddUserToRoomModal";
import Pusher, { PresenceChannel } from "pusher-js";
import React, { useEffect, useState } from "react";
import ScreenSharingModal from "./ScreenSharingModal";
import VideoList from "./VideoList";
import hark from "hark";
import posthog from "posthog-js";
import room from "src/reducers/room";
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
  const { settings, billing } = props;

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

  const {
    availableScreensToShare,
    screensourcesLoading,
  } = useGetAvailableScreensToShare();
  const dimensions = useResizeListener();

  useInitializeJanus();

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

  useEffect(() => {
    ipcRenderer.on("update-screen-sharing-controls", (_event, args) => {
      if (typeof args.toggleVideoOrAudio !== "undefined") {
        return this.toggleVideoOrAudio(args.toggleVideoOrAudio);
      }

      if (typeof args.toggleScreenSharing !== "undefined") {
        if (
          typeof args.entireScreen !== "undefined" &&
          args.toggleScreenSharing == true
        ) {
          return this.toggleScreenSharing("entire-screen");
        }
        return this.toggleScreenSharing();
      }

      if (typeof args.leaveRoom !== "undefined") {
        return this.stopPublishingStream();
      }

      ipcRenderer.invoke("update-screen-sharing-controls", {
        videoStatus: videoStatus,
        audioStatus: audioStatus,
        videoEnabled: room.video_enabled,
        screenSharingWindow: screenSharingWindow?.id,
      });

      ipcRenderer.invoke("update-tray-icon", {
        videoStatus: videoStatus,
        audioStatus: audioStatus,
        videoEnabled: room.video_enabled,
        screenSharingActive: screenSharingActive,
      });
    });

    return () => {
      ipcRenderer.removeAllListeners("update-screen-sharing-controls");
    };
  });

  /* TODO: refactor */
  const reconnectNetworkConnections = () => {
    const { pusherInstance, getRoomUsers } = this.props;
    const { room } = this.state;

    const presence_channel = pusherInstance.subscribe(
      `presence-room.${room.channel_id}`,
    );
    const that = this;

    presence_channel.bind_global(function (
      event: string,
      data: { members: any; me: { info: { media_server: any } } },
    ) {
      if (event == "pusher:subscription_succeeded") {
        that.setState({
          members: data.members,
          me: data.me,
          server: data.me.info.media_server,
        });
        that.openMediaHandle();
      }

      if (
        event == "room.user.invited" &&
        that.state.showAddUserToRoomModal == false
      ) {
        getRoomUsers(room.id);
      }
    });
  };

  /* TODO: finish refactor */
  const disconnectNetworkConnections = () => {
    const { pusherInstance } = props;

    if (room.channel_id && pusherInstance) {
      pusherInstance.unsubscribe(`presence-room.${room.channel_id}`);
    }

    if (publishing) {
      stopPublishingStream();
    }

    try {
      rootStreamerHandle.destroy({
        success: function () {
          setPublishers([]);
        },
      });
    } catch (error) {
      //do something
    }
  };

  return null;
}
