/* eslint-disable @typescript-eslint/no-explicit-any */
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
import AddUserToRoomModal from "./AddUserToRoomModal";
import React from "react";
import ScreenSharingModal from "./ScreenSharingModal";
import VideoList from "./VideoList";
import hark from "hark";
import posthog from "posthog-js";
const bodyPix = require("@tensorflow-models/body-pix");
const { BrowserWindow } = require("electron").remote;
const { ipcRenderer } = require("electron");
const { desktopCapturer } = require("electron");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let MAIN_WINDOW_WEBPACK_ENTRY: any;

interface RoomProps extends PropsFromRedux, RouteComponentProps {
  pusherInstance: any;
  userPrivateNotificationChannel: any;
  currentTime: any;
  backgroundBlurWindow: any;
  sidebarIsVisible: boolean;
  isLightMode: boolean;
  onClick(): void;
}

interface State {
  room: RoomType;
  team: Team;
  isCall: boolean;
  loading: boolean;
  members: User[];
  server: string | null;
  local_stream: any;
  publishers: any[];
  initialized: boolean;
  room_at_capacity: boolean;
  me: User;
  connected: boolean;
  publishing: boolean;
  heartbeatInterval?: NodeJS.Timeout;
  screenSharingActive: boolean;
  showScreenSharingModal: boolean;
  showScreenSharingDropdown: boolean;
  screenSharingHandle: any;
  screenSharingStream: any;
  screenSharingWindow: any;
  screenSharingError: boolean;
  screenSources: any[];
  screenSourcesLoading: boolean;
  leaving: boolean;
  videoSizes: {
    width: number;
    height: number;
    display: string;
    containerHeight: number;
    threadContainerHeight: number;
  };
  dimensions: {
    width: number;
    height: number;
    sidebarWidth: number;
  };
  pinned: boolean;
  videoStatus: boolean;
  audioStatus: boolean;
  videoIsFaceOnly: boolean;
  backgroundBlurWindow: any;
  backgroundBlurEnabled: boolean;
  backgroundBlurAmount: number;
  showMoreSettingsDropdown: boolean;
  streamer_server_connected: boolean;
  videoRoomStreamerHandle: any;
  rootStreamerHandle: any;
  loadingMessages: string[];
  currentLoadingMessage: string[];
  containerBackgroundColors: string[];
  showAddUserToRoomModal: boolean;
  showChatThread: boolean;
  localVideoContainer?: HTMLCanvasElement;
  localVideoCanvasContainer?: HTMLCanvasElement;
}

export default class Room extends React.Component<RoomProps, State> {
  private _mounted: boolean;
  constructor(props: RoomProps) {
    super(props);

    const { settings, billing } = this.props;

    this.state = {
      room: {},
      team: {},
      isCall: false,
      loading: true,
      members: [],
      server: null,
      local_stream: null,
      publishers: [],
      initialized: false,
      room_at_capacity: false,
      me: {},
      connected: false,
      publishing: false,
      screenSharingActive: false,
      showScreenSharingModal: false,
      showScreenSharingDropdown: false,
      screenSharingHandle: null,
      screenSharingStream: null,
      screenSharingWindow: null,
      screenSharingError: false,
      screenSources: [],
      screenSourcesLoading: false,
      leaving: false,
      videoSizes: {
        width: 0,
        height: 0,
        display: "row align-items-center justify-content-center h-100",
        containerHeight: (window.innerHeight - 114) / 2,
        threadContainerHeight: (window.innerHeight - 114) / 2,
      },
      dimensions: {
        width: window.innerWidth,
        height: window.innerHeight / 2,
        sidebarWidth: 280,
      },
      pinned: false,
      videoStatus: settings.roomSettings.videoEnabled && billing.plan == "Plus",
      audioStatus: settings.roomSettings.audioEnabled,
      videoIsFaceOnly: false,
      backgroundBlurWindow: null,
      backgroundBlurEnabled: settings.roomSettings.backgroundBlurEnabled,
      backgroundBlurAmount: settings.roomSettings.backgroundBlurAmount / 5,
      showMoreSettingsDropdown: false,
      streamer_server_connected: false,
      videoRoomStreamerHandle: null,
      rootStreamerHandle: null,
      loadingMessages: [
        "Waiting for other members to join...",
        "Grab a cup of coffee while you wait.",
        "We're never gonna give you up, never gonna let you down, even if you're the only one here.",
      ],
      currentLoadingMessage: [],
      containerBackgroundColors: [
        "#4381ff",
        "#4F4581",
        "#6936e3",
        "#e69a5a",
        "#205444",
        "#00DBD7",
      ],
      showAddUserToRoomModal: false,
      showChatThread: false,
    };

    this.initializeRoom = this.initializeRoom.bind(this);

    this.getAvailableScreensToShare = this.getAvailableScreensToShare.bind(
      this,
    );
    this.startPublishingScreenSharingStream = this.startPublishingScreenSharingStream.bind(
      this,
    );
    this.openScreenSharingHandle = this.openScreenSharingHandle.bind(this);
    this.toggleScreenSharing = this.toggleScreenSharing.bind(this);

    this.toggleVideoOrAudio = this.toggleVideoOrAudio.bind(this);
    this.handleRemoteStreams = this.handleRemoteStreams.bind(this);
    this.togglePinned = this.togglePinned.bind(this);
    this.subscribeToRemoteStream = this.subscribeToRemoteStream.bind(this);
    this.updateDisplayedVideosSizes = this.updateDisplayedVideosSizes.bind(
      this,
    );

    this.startBackgroundBlur = this.startBackgroundBlur.bind(this);
    this.stopBackgroundBlur = this.stopBackgroundBlur.bind(this);

    this.stopPublishingStream = this.stopPublishingStream.bind(this);

    //this.updateDisplayedVideos = debounce(this.updateDisplayedVideos, 200);

    this.openMediaHandle = this.openMediaHandle.bind(this);
    this.renderVideo = this.renderVideo.bind(this);

    this.reconnectNetworkConnections = this.reconnectNetworkConnections.bind(
      this,
    );
    this.disconnectNetworkConnections = this.disconnectNetworkConnections.bind(
      this,
    );
    this.getNewServer = this.getNewServer.bind(this);

    this.handleResize = this.handleResize.bind(this);
  }

  componentDidMount() {
    const { match, pusherInstance } = this.props;

    this._mounted = true;

    if (match.path == "/call/:roomSlug") {
      this.setState({ isCall: true });
    }

    if (process.env.REACT_APP_PLATFORM != "web") {
      ipcRenderer
        .invoke("get-media-access-status", { mediaType: "screen" })
        .then((response) => {
          if (response == "granted") {
            this.getAvailableScreensToShare();
          }
        });
    }

    window.addEventListener("resize", this.handleResize);
    this.handleResize();

    window.addEventListener("online", this.reconnectNetworkConnections);
    window.addEventListener("offline", this.disconnectNetworkConnections);

    if (process.env.REACT_APP_PLATFORM != "web") {
      ipcRenderer.on("power_update", (event, arg) => {
        if (arg == "suspend" || arg == "lock-screen") {
          this.disconnectNetworkConnections();
        }
        if (arg == "unlock-screen" || arg == "resume") {
          this.reconnectNetworkConnections();
        }
      });

      ipcRenderer.on("update-screen-sharing-controls", (event, args) => {
        if (typeof args.toggleVideoOrAudio != "undefined") {
          return this.toggleVideoOrAudio(args.toggleVideoOrAudio);
        }

        if (typeof args.toggleScreenSharing != "undefined") {
          if (
            typeof args.entireScreen != "undefined" &&
            args.toggleScreenSharing == true
          ) {
            return this.toggleScreenSharing("entire-screen");
          }
          return this.toggleScreenSharing();
        }

        if (typeof args.leaveRoom != "undefined") {
          return this.stopPublishingStream();
        }

        ipcRenderer.invoke("update-screen-sharing-controls", {
          videoStatus: this.state.videoStatus,
          audioStatus: this.state.audioStatus,
          videoEnabled: this.state.room.video_enabled,
          screenSharingWindow: this.state.screenSharingWindow.id,
        });

        ipcRenderer.invoke("update-tray-icon", {
          videoStatus: this.state.videoStatus,
          audioStatus: this.state.audioStatus,
          videoEnabled: this.state.room.video_enabled,
          screenSharingActive: this.state.screenSharingActive,
        });
      });
    }

    Janus.init({
      debug: process.env.NODE_ENV == "production" ? false : true,
      dependencies: Janus.useDefaultDependencies(),
      callback: function () {
        // Done!
      },
    });

    if (pusherInstance != null) {
      this.setState({ initialized: true }, () => {
        this.initializeRoom();
      });
    }
  }

  componentDidUpdate(prevProps: RoomProps, prevState: State): void {
    const {
      match,
      pusherInstance,
      user,
      settings,
      sidebarIsVisible,
    } = this.props;
    const {
      initialized,
      dimensions,
      publishers,
      publishing,
      rootStreamerHandle,
      videoIsFaceOnly,
      videoStatus,
      backgroundBlurEnabled,
      showChatThread,
    } = this.state;

    if (pusherInstance != null && initialized == false) {
      this.setState({ initialized: true }, () => {
        this.initializeRoom();
      });
    }

    //check if our room changed
    if (prevProps.match.params.roomSlug != match.params.roomSlug) {
      if (rootStreamerHandle != null) {
        for (var s in Janus.sessions) {
          Janus.sessions[s].destroy({
            unload: true,
            notifyDestroyed: false,
            success: function () {
              //Janus.sessions.splice(s, 1);
              delete Janus.sessions[s];
            },
          });
        }

        this.setState(
          {
            loading: true,
            members: [],
            server: null,
            local_stream: null,
            publishers: [],
            me: {},
            connected: false,
            publishing: false,
            initialized: false,
          },
          () => {
            this.initializeRoom();
          },
        );
      }
    }

    if (
      prevState.dimensions != dimensions ||
      prevState.publishers.length != publishers.length ||
      prevProps.sidebarIsVisible != sidebarIsVisible
    ) {
      this.updateDisplayedVideosSizes(null, true);
    }

    if (prevState.showChatThread != showChatThread) {
      this.handleResize();
    }

    if (
      prevState.publishers != publishers &&
      publishers.length > 0 &&
      publishing
    ) {
      this.handleRemoteStreams();
    }

    if (prevState.videoIsFaceOnly != videoIsFaceOnly) {
      const updatedPublishers = [...publishers];

      updatedPublishers.forEach((publisher) => {
        if (publisher.member.id == user.id) {
          publisher.videoIsFaceOnly = videoIsFaceOnly;
        }
      });

      this.setState({ publishers: updatedPublishers });
    }

    if (!videoStatus && prevState.videoStatus) {
      if (backgroundBlurEnabled) {
        this.stopBackgroundBlur();
      }
    }

    if (
      videoStatus &&
      !prevState.videoStatus &&
      settings.roomSettings.backgroundBlurEnabled
    ) {
      this.startBackgroundBlur();
    }

    if (
      settings.roomSettings.backgroundBlurAmount !=
      prevProps.settings.roomSettings.backgroundBlurAmount
    ) {
      this.setState({
        backgroundBlurAmount: settings.roomSettings.backgroundBlurAmount / 5,
      });
    }
  }

  componentWillUnmount(): void {
    const { pusherInstance, userPrivateNotificationChannel } = this.props;
    const {
      room,
      rootStreamerHandle,
      publishing,
      localVideoContainer,
      heartbeatInterval,
    } = this.state;

    this._mounted = false;

    if (localVideoContainer) {
      localVideoContainer.remove();
    }

    if (
      typeof room.channel_id != "undefined" &&
      typeof pusherInstance != "undefined" &&
      pusherInstance != null
    ) {
      pusherInstance.unsubscribe(`presence-room.${room.channel_id}`);
    }

    try {
      if (publishing) {
        this.stopPublishingStream();
      }
      rootStreamerHandle.destroy({
        success: function () {},
      });
    } catch (error) {
      //do something
    }

    if (userPrivateNotificationChannel !== false) {
      userPrivateNotificationChannel.unbind("call.declined");
    }

    if (heartbeatInterval != null) {
      clearInterval(heartbeatInterval);
    }

    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("online", this.reconnectNetworkConnections);
    window.removeEventListener("offline", this.disconnectNetworkConnections);

    if (process.env.REACT_APP_PLATFORM != "web") {
      ipcRenderer.removeAllListeners("power_update");
      ipcRenderer.removeAllListeners("update-screen-sharing-controls");
      ipcRenderer.removeAllListeners("face-tracking-update");
      ipcRenderer.removeAllListeners("background-blur-update");
    }
  }

  initializeRoom() {
    const {
      push,
      teams,
      match,
      location,
      pusherInstance,
      getRoomUsers,
      userPrivateNotificationChannel,
    } = this.props;

    let curTeam = {};
    let curRoom = {};

    if (
      typeof location.state != "undefined" &&
      location.state != null &&
      typeof location.state.room != "undefined" &&
      typeof location.state.team != "undefined"
    ) {
      curRoom = location.state.room;
      curTeam = location.state.team;
    } else {
      //get the slug and pull it from the global state
      teams.forEach(function (team: { rooms?: any }) {
        team.rooms.forEach(function (room: { slug?: any }) {
          if (room.slug == match.params.roomSlug) {
            curRoom = room;
            curTeam = team;
          }
        });
      });
    }

    if (curRoom === {}) {
      push("/");
    }

    posthog.capture("$pageview", { room_id: curRoom.id });

    userPrivateNotificationChannel.bind("call.declined", function () {});

    //refresh the count of users in this room
    getRoomUsers(curRoom.id);

    this.setState({ room: curRoom, team: curTeam });

    if (pusherInstance != null) {
      const presence_channel = pusherInstance.subscribe(
        `presence-room.${curRoom.channel_id}`,
      );
      const that = this;

      presence_channel.bind_global(function (
        event: string,
        data: {
          me: { info: { room_at_capacity: any; media_server: any } };
          members: any;
          triggered_by: any;
        },
      ) {
        if (event == "pusher:subscription_succeeded") {
          if (data.me.info.room_at_capacity) {
            return that.setState({ loading: false, room_at_capacity: true });
          }

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
          getRoomUsers(curRoom.id);
        }

        if (
          event == "room.server.updated" &&
          data.triggered_by != that.state.me.id
        ) {
          that.getNewServer();
        }
      });
    }
  }

  getNewServer() {
    this.disconnectNetworkConnections();
    this.reconnectNetworkConnections();

    if (this.state.publishing) {
      this.startPublishingStream();
    }
  }

  reconnectNetworkConnections() {
    const { pusherInstance, getRoomUsers } = this.props;
    const { room } = this.state;

    Janus.init({
      debug: process.env.NODE_ENV == "production" ? false : true,
      dependencies: Janus.useDefaultDependencies(),
      callback: function () {},
    });

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
  }

  disconnectNetworkConnections() {
    const { pusherInstance } = this.props;
    const { room, rootStreamerHandle, publishing } = this.state;
    if (typeof room.channel_id != "undefined" && pusherInstance != null) {
      pusherInstance.unsubscribe(`presence-room.${room.channel_id}`);
    }

    if (publishing) {
      this.stopPublishingStream();
    }

    const that = this;

    try {
      rootStreamerHandle.destroy({
        success: function () {
          that.setState({ publishers: [] });
        },
      });
    } catch (error) {
      //do something
    }
  }

  openMediaHandle() {
    const { me, room, server } = this.state;
    const that = this;

    if (server == null) {
      return false;
    }

    const rootStreamerHandle = new Janus({
      server: [`wss://${server}:4443/`, `https://${server}/streamer`],
      success: function () {
        that.setState({ rootStreamerHandle });

        rootStreamerHandle.attach({
          plugin: "janus.plugin.videoroom",
          opaqueId: me.info.peer_uuid,
          success: function (videoRoomStreamerHandle: {
            send: (arg0: {
              message: {
                request: string;
                room: any;
                ptype: string;
                display: any;
                token: any;
                pin: any;
              };
            }) => void;
          }) {
            that.setState({ videoRoomStreamerHandle });

            //register a publisher
            const request = {
              request: "join",
              room: room.channel_id,
              ptype: "publisher",
              display: me.info.peer_uuid,
              token: me.info.streamer_key,
              pin: me.info.room_pin,
            };

            videoRoomStreamerHandle.send({ message: request });
          },
          error: function () {
            // Couldn't attach to the plugin
            if (that.props.pusherInstance.connection.state == "connected") {
              that.getNewServer();
            }
          },
          onmessage: function (
            msg: {
              videoroom: string;
              private_id: any;
              publishers: any[];
              leaving: any;
              unpublished: any;
            },
            jsep: any,
          ) {
            let {
              videoRoomStreamerHandle,
              currentLoadingMessage,
              containerBackgroundColors,
              members,
            } = that.state;

            if (jsep != null) {
              videoRoomStreamerHandle.handleRemoteJsep({ jsep: jsep });
            }

            if (msg.videoroom == "joined") {
              const updatedMe = that.state.me;
              updatedMe.info.private_id = msg.private_id;

              if (msg.publishers.length > 0) {
                const updatedPublishers: any[] = [];

                msg.publishers.forEach(
                  (publisher: {
                    display: any;
                    member: any;
                    containerBackgroundColor: any;
                    loading: boolean;
                  }) => {
                    const rand = Math.floor(
                      Math.random() * containerBackgroundColors.length,
                    );
                    each(members, function (member) {
                      if (member.peer_uuid == publisher.display) {
                        publisher.member = member;
                      }
                    });
                    publisher.containerBackgroundColor =
                      containerBackgroundColors[rand];

                    if (typeof publisher.loading == "undefined") {
                      publisher.loading = false;
                    }

                    updatedPublishers.push(publisher);
                  },
                );

                that.setState({
                  connected: true,
                  loading: false,
                  publishers: [...that.state.publishers, ...updatedPublishers],
                  me: updatedMe,
                });
              } else {
                currentLoadingMessage = [];

                if (that.state.isCall) {
                  currentLoadingMessage.push(
                    <div key={99999}>
                      <h1 className="text-center">Calling...</h1>
                    </div>,
                  );
                } else {
                  currentLoadingMessage.push(
                    <div key={99999}>
                      <h1 className="text-center">This room is empty.</h1>
                      <h2 className="text-center h3">
                        Your teammates will appear here automatically after
                        joining.
                      </h2>
                    </div>,
                  );
                }

                that.setState({
                  connected: true,
                  loading: false,
                  currentLoadingMessage,
                });
              }

              if (that.state.isCall == true) {
                that.startPublishingStream();
              }
            }

            if (msg.videoroom == "event") {
              //check if we have new publishers to subscribe to
              if (typeof msg.publishers != "undefined") {
                const newPublishers = msg.publishers;

                const rand = Math.floor(
                  Math.random() * containerBackgroundColors.length,
                );
                let currentPublishers = [...that.state.publishers];

                newPublishers.forEach(
                  (publisher: {
                    display: any;
                    member: any;
                    containerBackgroundColor: any;
                    loading: boolean;
                  }) => {
                    each(members, function (member) {
                      if (member.peer_uuid == publisher.display) {
                        publisher.member = member;
                      }
                    });
                    publisher.containerBackgroundColor =
                      containerBackgroundColors[rand];

                    if (typeof publisher.loading == "undefined") {
                      publisher.loading = true;
                    }
                  },
                );

                currentPublishers = currentPublishers.filter((publisher) => {
                  let keep = true;
                  newPublishers.forEach(
                    (newPublisher: {
                      member: { id: any };
                      id: string | string[];
                    }) => {
                      if (
                        newPublisher.member.id == publisher.member.id &&
                        !newPublisher.id.includes("_screensharing")
                      ) {
                        keep = false;
                      }
                    },
                  );
                  return keep;
                });

                that.setState({
                  publishers: [...newPublishers, ...currentPublishers],
                });
              }

              if (typeof msg.leaving != "undefined") {
                var updatedPublishers = [...that.state.publishers];
                updatedPublishers = updatedPublishers.filter((item) => {
                  return item.id != msg.leaving;
                });

                that.setState({ publishers: updatedPublishers });
              }

              if (typeof msg.unpublished != "undefined") {
                var updatedPublishers = [...that.state.publishers];
                updatedPublishers = updatedPublishers.filter((item) => {
                  return item.id != msg.unpublished;
                });

                that.setState({ publishers: updatedPublishers });
              }
            }
          },
          ondataopen: function () {},
          ondata: function () {},
          slowLink: function () {},
          mediaState: function () {},
          webrtcState: function () {},
          iceState: function () {},
          oncleanup: function () {
            // PeerConnection with the plugin closed, clean the UI
            // The plugin handle is still valid so we can create a new one
          },
          detached: function () {
            // Connection with the plugin closed, get rid of its features
            // The plugin handle is not valid anymore
          },
          destroyed: function () {},
        });
      },
      error: function () {
        // Error, can't go on...

        //sanity check to make sure we still have an internet connection
        if (that.props.pusherInstance.connection.state == "connected") {
          that.getNewServer();
        }
      },
      destroyed: function () {
        // I should get rid of this
      },
    });
  }

  async startPublishingStream() {
    const { settings, user } = this.props;
    const {
      videoRoomStreamerHandle,
      audioStatus,
      videoStatus,
      localVideoContainer,
      localVideoCanvasContainer,
    } = this.state;

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

    const raw_local_stream = await navigator.mediaDevices.getUserMedia(
      streamOptions,
    );

    if (typeof localVideoContainer != "undefined") {
      localVideoContainer.remove();
    }

    if (typeof localVideoCanvasContainer != "undefined") {
      localVideoCanvasContainer.remove();
    }

    let localVideo: HTMLCanvasElement;
    let localVideoCanvas: HTMLCanvasElement;
    let backgroundBlurVideoCanvasCopy: HTMLCanvasElement;

    const that = this;

    const publishStream = async () => {
      let local_stream: MediaStream;

      if (process.env.REACT_APP_PLATFORM != "web") {
        local_stream = localVideoCanvas.captureStream(60);

        const raw_tracks = raw_local_stream.getTracks();
        raw_tracks.forEach((track) => {
          if (track.kind == "audio") {
            local_stream.addTrack(track);
          }
        });
      } else {
        local_stream = raw_local_stream;
      }

      const speechEvents = hark(local_stream);

      speechEvents.on("speaking", function () {
        const { publishers } = that.state;
        const dataMsg = {
          type: "started_speaking",
          publisher_id: user.id,
        };

        videoRoomStreamerHandle.data({
          text: JSON.stringify(dataMsg),
        });

        const updatedPublishers = [...publishers];

        updatedPublishers.forEach((publisher) => {
          if (publisher.member.id == user.id) {
            publisher.speaking = true;
          }
        });

        that.setState({ publishers: updatedPublishers });
      });

      speechEvents.on("stopped_speaking", function () {
        const { publishers } = that.state;
        const dataMsg = {
          type: "stopped_speaking",
          publisher_id: user.id,
        };

        videoRoomStreamerHandle.data({
          text: JSON.stringify(dataMsg),
        });

        const updatedPublishers = [...publishers];

        updatedPublishers.forEach((publisher) => {
          if (publisher.member.id == user.id) {
            publisher.speaking = false;
          }
        });

        that.setState({ publishers: updatedPublishers });
      });

      const tracks = raw_local_stream.getTracks();

      tracks.forEach(function (track) {
        if (track.kind == "video") {
          track.enabled = videoStatus;
        } else {
          track.enabled = audioStatus;
        }
      });

      this.setState({
        local_stream: raw_local_stream,
        localVideoContainer: localVideo,
        localVideoCanvasContainer,
      });

      //publish our feed
      videoRoomStreamerHandle.createOffer({
        stream: local_stream,
        media: {
          audioRecv: false,
          videoRecv: false,
          audioSend: true,
          videoSend: true,
          data: true,
        },
        success: function (jsep: any) {
          const request = {
            request: "publish",
            audio: true,
            video: true,
            data: true,
          };

          videoRoomStreamerHandle.send({ message: request, jsep: jsep });

          const { containerBackgroundColors, me } = that.state;

          const rand = Math.floor(
            Math.random() * containerBackgroundColors.length,
          );

          const newPublisher = {
            containerBackgroundColor: containerBackgroundColors[rand],
            loading: false,
            member: me.info,
            hasVideo: videoStatus,
            hasAudio: audioStatus,
            id: me.id.toString(),
            stream: local_stream,
          };

          let updatedPublishers = [...that.state.publishers];

          updatedPublishers = updatedPublishers.filter((publisher) => {
            return publisher.id != me.id;
          });

          updatedPublishers.push(newPublisher);

          const heartbeatInterval = setInterval(() => {
            const dataMsg = {
              type: "participant_status_update",
              publisher_id: user.id,
              video_status: that.state.videoStatus,
              audio_status: that.state.audioStatus,
              face_only_status: that.state.videoIsFaceOnly,
            };

            videoRoomStreamerHandle.data({
              text: JSON.stringify(dataMsg),
            });
          }, 30000);

          that.setState({
            publishing: true,
            publishers: updatedPublishers,
            heartbeatInterval,
          });

          if (process.env.REACT_APP_PLATFORM != "web") {
            ipcRenderer.invoke("update-tray-icon", {
              enable: true,
              videoStatus,
              audioStatus,
              videoEnabled: that.state.room.video_enabled,
              screenSharingActive: that.state.screenSharingActive,
            });
          }

          that.handleRemoteStreams();
        },
      });
    };

    if (process.env.REACT_APP_PLATFORM != "web") {
      localVideo = document.createElement("video");
      localVideo.srcObject = raw_local_stream;
      localVideo.muted = true;
      localVideo.autoplay = true;
      localVideo.setAttribute("playsinline", "");
      localVideo.play();

      localVideoCanvas = document.createElement("canvas");

      backgroundBlurVideoCanvasCopy = document.createElement("canvas");

      localVideo.onloadedmetadata = () => {
        localVideo.width = localVideo.videoWidth;
        localVideo.height = localVideo.videoHeight;
      };

      let facePrediction: {
        prediction: { probability: any[]; topLeft: number[]; length: number };
      } = null;

      let drawParams = {
        sourceX: 0,
        sourceY: 0,
        sourceWidth: 0,
        sourceHeight: 0,
        destinationX: 0,
        destinationY: 0,
        destinationWidth: 0,
        destinationHeight: 0,
        sourceNoseScore: 0,
      };

      const avatarImage = new Image();
      let avatarImageLoaded = false;
      avatarImage.onload = () => {
        avatarImageLoaded = true;
      };
      avatarImage.src = user.avatar_url;

      const ctx = localVideoCanvas.getContext("2d");

      if (process.env.REACT_APP_PLATFORM != "web") {
        ipcRenderer.removeAllListeners("face-tracking-update");
        ipcRenderer.on("face-tracking-update", (event, args) => {
          if (args.type == "updated_coordinates") {
            facePrediction = args.facePrediction;
          }
        });
      }

      let personSegmentation: any = null;

      if (process.env.REACT_APP_PLATFORM != "web") {
        ipcRenderer.removeAllListeners("background-blur-update");
        ipcRenderer.on("background-blur-update", (event, args) => {
          if (args.type == "updated_coordinates") {
            personSegmentation = args.personSegmentation;
          }
        });
      }

      if (settings.roomSettings.backgroundBlurEnabled) {
        this.startBackgroundBlur();
      }

      const edgeBlurAmount = 5;
      const flipHorizontal = false;

      localVideo.onplaying = async () => {
        async function bodySegmentationFrame() {
          if (that._mounted == false) {
            return;
          }

          if (
            that.state.videoStatus == false ||
            that.state.publishing == false
          ) {
            return requestAnimationFrame(bodySegmentationFrame);
          }

          if (!that.state.videoIsFaceOnly || facePrediction == null) {
            localVideoCanvas.width = localVideo.width;
            localVideoCanvas.height = localVideo.height;

            if (
              personSegmentation != null &&
              that.state.backgroundBlurEnabled
            ) {
              bodyPix.drawBokehEffect(
                localVideoCanvas,
                localVideo,
                personSegmentation,
                that.state.backgroundBlurAmount,
                edgeBlurAmount,
                flipHorizontal,
              );

              return requestAnimationFrame(bodySegmentationFrame);
            }

            facePrediction = null;

            ctx.drawImage(localVideo, 0, 0);

            return requestAnimationFrame(bodySegmentationFrame);
          }

          if (
            typeof facePrediction.prediction == "undefined" ||
            (facePrediction.prediction.probability[0] < 0.2 &&
              avatarImageLoaded)
          ) {
            //ctx.drawImage(avatarImage, 0, 0);

            if (localVideoCanvas.width != 400) {
              localVideoCanvas.width = 400;
              localVideoCanvas.height = 400;
            }

            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillRect(0, 0, 400, 400);
            return requestAnimationFrame(bodySegmentationFrame);
          }

          if (drawParams.sourceX == 0 || drawParams.sourceY == 0) {
            drawParams = {
              sourceX: facePrediction.prediction.topLeft[0] - 100,
              sourceY: facePrediction.prediction.topLeft[1] - 125,
              sourceWidth: 400,
              sourceHeight: 400,
              destinationX: 0,
              destinationY: 0,
              destinationWidth: 400,
              destinationHeight: 400,
              sourceNoseScore: facePrediction.prediction.probability[0],
            };
          }

          if (
            Math.abs(
              drawParams.sourceX - (facePrediction.prediction.topLeft[0] - 100),
            ) > 20 ||
            Math.abs(
              drawParams.sourceY - (facePrediction.prediction.topLeft[1] - 125),
            ) > 20
          ) {
            const drawParamsCopy = { ...drawParams };

            return requestAnimationFrame(() => {
              gradualFrameMove(
                drawParamsCopy.sourceX,
                drawParamsCopy.sourceY,
                facePrediction.prediction.topLeft[0] - 100,
                facePrediction.prediction.topLeft[1] - 125,
              );
            });
          }

          if (localVideoCanvas.width != 400) {
            localVideoCanvas.width = 400;
            localVideoCanvas.height = 400;
          }

          //draw black every time so we don't see parts of previous frames if it jumps around a little bit
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.fillRect(0, 0, 400, 400);

          if (personSegmentation != null && that.state.backgroundBlurEnabled) {
            bodyPix.drawBokehEffect(
              backgroundBlurVideoCanvasCopy,
              localVideo,
              personSegmentation,
              that.state.backgroundBlurAmount,
              edgeBlurAmount,
              flipHorizontal,
            );

            ctx.drawImage(
              backgroundBlurVideoCanvasCopy,
              drawParams.sourceX,
              drawParams.sourceY,
              drawParams.sourceWidth,
              drawParams.sourceHeight,
              drawParams.destinationX,
              drawParams.destinationY,
              drawParams.destinationWidth,
              drawParams.destinationHeight,
            );

            return requestAnimationFrame(bodySegmentationFrame);
          }

          ctx.drawImage(
            localVideo,
            drawParams.sourceX,
            drawParams.sourceY,
            drawParams.sourceWidth,
            drawParams.sourceHeight,
            drawParams.destinationX,
            drawParams.destinationY,
            drawParams.destinationWidth,
            drawParams.destinationHeight,
          );

          requestAnimationFrame(bodySegmentationFrame);
        }

        async function gradualFrameMove(
          initialX: number,
          initialY: number,
          targetX: number,
          targetY: number,
        ) {
          const { videoIsFaceOnly, videoStatus, publishing } = that.state;

          if (!that._mounted) {
            return;
          }

          if (!videoIsFaceOnly || !videoStatus || !publishing) {
            return requestAnimationFrame(bodySegmentationFrame);
          }

          if (
            typeof facePrediction.prediction == "undefined" ||
            facePrediction.prediction.length == 0
          ) {
            return requestAnimationFrame(bodySegmentationFrame);
          }

          if (facePrediction.prediction.length > 0) {
            if (
              facePrediction.prediction.topLeft[0] - 100 != targetX ||
              facePrediction.prediction.topLeft[1] - 125 != targetY
            ) {
              if (
                Math.abs(
                  targetX - (facePrediction.prediction.topLeft[0] - 100),
                ) > 20 ||
                Math.abs(
                  targetY - (facePrediction.prediction.topLeft[1] - 125),
                ) > 20
              ) {
                const drawParamsCopy = { ...drawParams };

                return requestAnimationFrame(() => {
                  gradualFrameMove(
                    drawParamsCopy.sourceX,
                    drawParamsCopy.sourceY,
                    facePrediction.prediction.topLeft[0] - 100,
                    facePrediction.prediction.topLeft[1] - 125,
                  );
                });
              }
            }
          }

          if (initialX > targetX) {
            //going to the right

            if (drawParams.sourceX > targetX) {
              const newX = drawParams.sourceX - 2;
            }
          } else {
            //going to the left

            if (drawParams.sourceX < targetX) {
              const newX = drawParams.sourceX + 2;
            }
          }

          if (initialY > targetY) {
            //going down

            if (drawParams.sourceY > targetY) {
              const newY = drawParams.sourceY - 2;
            }
          } else {
            //going up

            if (drawParams.sourceY < targetY) {
              const newY = drawParams.sourceY + 2;
            }
          }

          drawParams = {
            sourceX: typeof newX != "undefined" ? newX : drawParams.sourceX,
            sourceY: typeof newY != "undefined" ? newY : drawParams.sourceY,
            sourceWidth: localVideo.width,
            sourceHeight: localVideo.height,
            destinationX: 0,
            destinationY: 0,
            destinationWidth: localVideo.width,
            destinationHeight: localVideo.height,
            sourceNoseScore: facePrediction.prediction.probability[0],
          };

          if (localVideoCanvas.width != 400) {
            localVideoCanvas.width = 400;
            localVideoCanvas.height = 400;
          }

          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.fillRect(0, 0, 400, 400);

          if (personSegmentation != null && that.state.backgroundBlurEnabled) {
            bodyPix.drawBokehEffect(
              backgroundBlurVideoCanvasCopy,
              localVideo,
              personSegmentation,
              that.state.backgroundBlurAmount,
              edgeBlurAmount,
              flipHorizontal,
            );

            ctx.drawImage(
              backgroundBlurVideoCanvasCopy,
              drawParams.sourceX,
              drawParams.sourceY,
              drawParams.sourceWidth,
              drawParams.sourceHeight,
              drawParams.destinationX,
              drawParams.destinationY,
              drawParams.destinationWidth,
              drawParams.destinationHeight,
            );
          } else {
            ctx.drawImage(
              localVideo,
              drawParams.sourceX,
              drawParams.sourceY,
              drawParams.sourceWidth,
              drawParams.sourceHeight,
              drawParams.destinationX,
              drawParams.destinationY,
              drawParams.destinationWidth,
              drawParams.destinationHeight,
            );
          }

          if (typeof newX == "undefined" && typeof newY == "undefined") {
            //nothing changed, break out of this loop
            return requestAnimationFrame(bodySegmentationFrame);
          }

          requestAnimationFrame(() => {
            gradualFrameMove(initialX, initialY, targetX, targetY);
          });
        }

        bodySegmentationFrame();

        publishStream(raw_local_stream, localVideoCanvas);
      };
    }

    if (process.env.REACT_APP_PLATFORM == "web") {
      publishStream(raw_local_stream, localVideoCanvas);
    }
  }

  stopPublishingStream() {
    const {
      videoRoomStreamerHandle,
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

    if (videoRoomStreamerHandle == null) {
      return;
    }

    const request = {
      request: "unpublish",
    };

    videoRoomStreamerHandle.send({ message: request });

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
  }

  startBackgroundBlur() {
    const { backgroundBlurWindow } = this.props;
    const { room } = this.state;

    ipcRenderer.invoke("net-status-update", {
      window: backgroundBlurWindow.id,
      net: "backgroundBlur",
      status: true,
    });

    this.setState({ backgroundBlurEnabled: true });

    posthog.capture("background-blur-started", { room_id: room.id });
  }

  stopBackgroundBlur() {
    const { backgroundBlurWindow } = this.props;
    const { room } = this.state;

    ipcRenderer.invoke("net-status-update", {
      window: backgroundBlurWindow.id,
      net: "backgroundBlur",
      status: false,
    });

    this.setState({ backgroundBlurEnabled: false });

    posthog.capture("background-blur-stopped", { room_id: room.id });
  }

  openScreenSharingHandle() {
    const { rootStreamerHandle, me, room } = this.state;

    const that = this;

    rootStreamerHandle.attach({
      plugin: "janus.plugin.videoroom",
      opaqueId: me.info.peer_uuid,
      success: function (screenSharingHandle: {
        send: (arg0: {
          message: {
            request: string;
            id: string;
            room: any;
            ptype: string;
            display: any;
            token: any;
            pin: any;
          };
        }) => void;
      }) {
        that.setState({ screenSharingHandle });

        //register a publisher
        const request = {
          request: "join",
          id: me.info.id.toString() + "_screensharing",
          room: room.channel_id,
          ptype: "publisher",
          display: me.info.peer_uuid,
          token: me.info.streamer_key,
          pin: me.info.room_pin,
        };

        screenSharingHandle.send({ message: request });

        return that.startPublishingScreenSharingStream();
      },
      onmessage: function (msg: any, jsep: any) {
        const { screenSharingHandle } = that.state;

        if (jsep != null) {
          screenSharingHandle.handleRemoteJsep({ jsep: jsep });
        }
      },
      error: function () {
        // Couldn't attach to the plugin
      },
    });
  }

  async startPublishingScreenSharingStream() {
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
  }

  handleRemoteStreams() {
    const { user } = this.props;
    const { publishers } = this.state;

    publishers.forEach(
      (
        publisher: { handle: any; member: { id: any }; id: string | string[] },
        key: any,
      ) => {
        if (
          (typeof publisher.handle == "undefined" ||
            publisher.handle == null) &&
          publisher.member.id != user.id
        ) {
          this.subscribeToRemoteStream(publisher, key);

          if (publisher.id.includes("_screensharing")) {
            this.togglePinned(publisher);
          }
        }
      },
    );
  }

  togglePinned(publisherToPin: { id: any }) {
    const { publishers } = this.state;

    let pinned = false;

    publishers.forEach(
      (publisher: { id: any; pinned: boolean }, key: boolean) => {
        if (publisher.id != publisherToPin.id) {
          return (publisher.pinned = false);
        }

        if (typeof publisher.pinned != "undefined" && publisher.pinned) {
          return (publisher.pinned = false);
        }

        publisher.pinned = true;
        pinned = key;
      },
    );

    this.setState({ publishers, pinned });
  }

  subscribeToRemoteStream(publisher: { id: any }, key: string | number) {
    const { user } = this.props;
    const {
      me,
      room,
      publishers,
      rootStreamerHandle,
      videoRoomStreamerHandle,
    } = this.state;

    let handle: {
      createAnswer: (arg0: {
        jsep: any;
        media: { audioSend: boolean; videoSend: boolean; data: boolean };
        success: (jsep: any) => void;
      }) => void;
      send: (arg0: {
        message: { request: string; room: any };
        jsep: any;
      }) => void;
    };
    const that = this;

    rootStreamerHandle.attach({
      plugin: "janus.plugin.videoroom",
      opaqueId: me.info.peer_uuid,
      success: function (remoteHandle: {
        send: (arg0: {
          message: {
            request: string;
            room: any;
            ptype: string;
            display: any;
            token: any;
            feed: any;
            private_id: any;
          };
        }) => void;
      }) {
        handle = remoteHandle;

        //subscribe to the feed
        const request = {
          request: "join",
          room: room.channel_id,
          ptype: "subscriber",
          display: me.info.peer_uuid,
          token: me.info.streamer_key,
          feed: publisher.id,
          private_id: me.info.private_id,
        };

        remoteHandle.send({ message: request });
      },
      error: function () {
        // Couldn't attach to the plugin
        if (that.props.pusherInstance.connection.state == "connected") {
          that.getNewServer();
        }
      },
      onmessage: function (msg: { display: any; room: any }, jsep: any) {
        if (jsep != null) {
          if (typeof msg.display != "undefined") {
            handle.createAnswer({
              jsep: jsep,
              media: { audioSend: false, videoSend: false, data: true },
              success: function (jsep: any) {
                const request = {
                  request: "start",
                  room: msg.room,
                };

                handle.send({ message: request, jsep: jsep });
              },
            });
          }
        }
      },
      onremotestream: function (remote_stream: { getTracks: () => any }) {
        const updatedPublishers = [...publishers];

        if (typeof updatedPublishers[key] != "undefined") {
          updatedPublishers[key].stream = remote_stream;
          updatedPublishers[key].hasVideo = updatedPublishers[key].id.includes(
            "_screensharing",
          );
          updatedPublishers[key].hasAudio = true;
          updatedPublishers[key].handle = handle;
          updatedPublishers[key].active = true;

          that.setState({ publishers: updatedPublishers });
        }
      },
      ondataopen: function () {
        const { videoRoomStreamerHandle } = that.state;
        const dataMsg = {
          type: "initial_video_audio_status",
          publisher_id: user.id,
          video_status: that.state.videoStatus,
          audio_status: that.state.audioStatus,
          face_only_status: that.state.videoIsFaceOnly,
        };

        setTimeout(() => {
          videoRoomStreamerHandle.data({
            text: JSON.stringify(dataMsg),
          });
        }, 1000);
      },
      ondata: function (data: string) {
        const { publishers } = that.state;
        const dataMsg = JSON.parse(data);

        if (
          dataMsg.type == "initial_video_audio_status_response" &&
          dataMsg.requesting_publisher_id != user.id
        ) {
          return;
        }

        const updatedPublishers = [...publishers];

        updatedPublishers.forEach((publisher) => {
          if (publisher.member.id == dataMsg.publisher_id) {
            if (dataMsg.type == "audio_toggled") {
              publisher.hasAudio = dataMsg.audio_status;
            }

            if (dataMsg.type == "video_toggled") {
              publisher.hasVideo = dataMsg.video_status;
            }

            if (dataMsg.type == "face_only_status_toggled") {
              publisher.videoIsFaceOnly = dataMsg.face_only_status;
            }

            if (dataMsg.type == "initial_video_audio_status") {
              publisher.hasAudio = dataMsg.audio_status;
              publisher.hasVideo = dataMsg.video_status;
              publisher.videoIsFaceOnly = dataMsg.face_only_status;
            }

            if (dataMsg.type == "started_speaking") {
              publisher.speaking = true;
            }

            if (dataMsg.type == "stopped_speaking") {
              publisher.speaking = false;
            }

            if (dataMsg.type == "participant_status_update") {
              publisher.hasAudio = dataMsg.audio_status;
              publisher.hasVideo = dataMsg.video_status;
              publisher.videoIsFaceOnly = dataMsg.face_only_status;
            }
          }
        });

        if (dataMsg.type == "initial_video_audio_status") {
          const dataMsgResponse = {
            type: "initial_video_audio_status_response",
            publisher_id: user.id,
            requesting_publisher_id: dataMsg.publisher_id,
            video_status: that.state.videoStatus,
            audio_status: that.state.audioStatus,
            face_only_status: that.state.videoIsFaceOnly,
          };

          videoRoomStreamerHandle.data({
            text: JSON.stringify(dataMsgResponse),
          });
        }

        that.setState({ publishers: updatedPublishers });
      },
      slowLink: function () {},
      mediaState: function () {},
      oncleanup: function () {},
      detached: function () {},
    });
  }

  handleResize() {
    const { dimensions, showChatThread } = this.state;

    const newWidth = window.innerWidth;
    let newHeight = window.innerHeight;

    if (showChatThread) {
      newHeight = newHeight / 2;
    } else {
      newHeight = newHeight - 50;
    }

    this.setState({
      dimensions: {
        width: newWidth,
        height: newHeight,
        sidebarWidth: dimensions.sidebarWidth,
      },
    });
  }

  updateDisplayedVideosSizes() {
    let { dimensions, videoSizes, publishers, showChatThread } = this.state;
    const { sidebarIsVisible } = this.props;

    if (remote_streams == null) {
      var { remote_streams } = this.state;
    }

    let width = dimensions.width;
    let height = dimensions.height;
    let maxWidth = dimensions.width;

    if (sidebarIsVisible) {
      width -= 250;
      maxWidth -= 250;
    }

    const remote_streams_count = publishers.length;

    let rows = 1;
    let columns = 1;

    if (remote_streams_count > 0) {
      if (remote_streams_count >= 2) {
        if (dimensions.width > 980) {
          if (remote_streams_count > 2) {
            rows = 2;
          }

          if (remote_streams_count >= 2 && remote_streams_count <= 4) {
            columns = 2;
          }

          if (remote_streams_count > 4 && remote_streams_count <= 6) {
            columns = 3;
          }

          if (remote_streams_count > 6 && remote_streams_count <= 8) {
            columns = 4;
          }

          if (remote_streams_count > 8 && remote_streams_count <= 12) {
            rows = 3;
            columns = 4;
          }

          if (remote_streams_count > 12 && remote_streams_count <= 16) {
            rows = 4;
            columns = 4;
          }

          if (remote_streams_count > 16 && remote_streams_count <= 20) {
            rows = 4;
            columns = 5;
          }

          if (remote_streams_count > 20 && remote_streams_count <= 25) {
            rows = 5;
            columns = 5;
          }
        } else {
          if (remote_streams_count == 2) {
            rows = 2;
          }

          if (remote_streams_count > 2) {
            columns = 2;
            rows = 2;
          }

          if (remote_streams_count > 2 && remote_streams_count <= 4) {
            rows = remote_streams_count;
            columns = 1;
          }

          if (remote_streams_count > 4) {
            rows = Math.floor(remote_streams_count / 2);
            columns = 2;
          }
        }
      }

      const aspectRatio = 4 / 3;

      height = Math.round(width / aspectRatio);

      while (
        height * rows > dimensions.height - 250 ||
        width * columns > maxWidth - 100
      ) {
        width = width - 5;
        height = Math.round(width / aspectRatio);
      }

      let pinnedWidth = dimensions.width - 25;
      let pinnedHeight = Math.round(pinnedWidth / aspectRatio);

      while (pinnedHeight > dimensions.height - 120) {
        pinnedWidth -= 5;
        pinnedHeight = Math.round(pinnedWidth / aspectRatio);
      }

      let display = "row align-items-center justify-content-center h-100";

      if (dimensions.width < 1080) {
        display = "row align-items-center justify-content-center h-100";
      }

      videoSizes = {
        height: height,
        width: width,
        display: display,
        containerHeight: dimensions.height - 75,
        threadContainerHeight: showChatThread ? dimensions.height : 65,
        pinnedHeight,
        pinnedWidth,
        rows,
        columns,
      };

      return this.setState({ videoSizes });
    }

    this.setState({
      videoSizes: {
        width: 0,
        height: 0,
        display: "row align-items-center justify-content-center h-100",
        containerHeight: dimensions.height - 75,
        threadContainerHeight: showChatThread ? dimensions.height : 65,
      },
    });
  }

  renderVideo(source: any) {
    return (video: { srcObject: any }) => {
      if (video != null) {
        video.srcObject = source;
      }
    };
  }

  createDetachedWindow() {}

  toggleVideoOrAudio(type: string) {
    const { user } = this.props;
    const {
      videoRoomStreamerHandle,
      local_stream,
      videoStatus,
      audioStatus,
      screenSharingWindow,
      room,
      publishers,
    } = this.state;

    let updatedVideoStatus = clone(videoStatus);
    let updatedAudioStatus = clone(audioStatus);

    if (typeof local_stream !== "undefined") {
      const tracks = local_stream.getTracks();

      tracks.forEach(function (track: { kind: any; enabled: boolean }) {
        if (track.kind == type) {
          track.enabled = track.enabled ? false : true;

          if (type == "video") {
            updatedVideoStatus = track.enabled ? true : false;
          } else {
            updatedAudioStatus = track.enabled ? true : false;
          }
        }
      });

      /*if (videoRoomStreamerHandle != null) {
                //update our published stream
                var request = {
                    "request": "configure",
                    "audio": updatedAudioStatus,
                    "video": updatedVideoStatus,
                    "videocodec": "vp9"
                }

                videoRoomStreamerHandle.send({ "message": request });
            }*/

      if (screenSharingWindow != null) {
        ipcRenderer.invoke("update-screen-sharing-controls", {
          updatedVideoStatus,
          updatedAudioStatus,
          videoEnabled: this.state.room.video_enabled,
          screenSharingWindow: screenSharingWindow.id,
        });
      }

      if (process.env.REACT_APP_PLATFORM != "web") {
        ipcRenderer.invoke("update-tray-icon", {
          updatedVideoStatus,
          updatedAudioStatus,
          videoEnabled: this.state.room.video_enabled,
          screenSharingActive: this.state.screenSharingActive,
        });
      }

      if (type == "video") {
        posthog.capture("video-toggled", {
          room_id: room.id,
          "video-enabled": updatedVideoStatus,
        });
      } else {
        posthog.capture("audio-toggled", {
          room_id: room.id,
          "audio-enabled": updatedAudioStatus,
        });
      }

      const updatedPublishers = [...publishers];

      updatedPublishers.forEach((publisher) => {
        if (publisher.member.id == user.id) {
          publisher.hasAudio = updatedAudioStatus;
          publisher.hasVideo = updatedVideoStatus;
        }
      });

      let dataMsg = {
        type: "video_toggled",
        publisher_id: user.id,
        video_status: updatedVideoStatus,
      };

      if (type == "audio") {
        dataMsg = {
          type: "audio_toggled",
          publisher_id: user.id,
          audio_status: updatedAudioStatus,
        };
      }

      videoRoomStreamerHandle.data({
        text: JSON.stringify(dataMsg),
      });

      this.setState({
        videoStatus: updatedVideoStatus,
        audioStatus: updatedAudioStatus,
        publishers: updatedPublishers,
      });
    }
  }

  async getAvailableScreensToShare() {
    const screenSources: {
      icon: string;
      display_id: string;
      id: string;
      name: string;
      thumbnail: string;
    }[] = [];

    const sources = await desktopCapturer.getSources({
      types: ["window", "screen"],
      thumbnailSize: { width: 1000, height: 1000 },
      fetchWindowIcons: true,
    });

    sources.forEach((source) => {
      if (!source.name.includes("Blab")) {
        let icon = null;
        if (source.appIcon != null) {
          icon = source.appIcon.toDataURL();
        }

        if (source.name != null && source.name.length > 50) {
          source.name = source.name.slice(0, 49);
          source.name = source.name.trim() + "...";
        }

        const newSource = {
          icon,
          display_id: source.display_id,
          id: source.id,
          name: source.name,
          thumbnail: source.thumbnail.toDataURL(),
        };
        screenSources.push(newSource);
      }
    });

    this.setState({ screenSources, screenSourcesLoading: false });
  }

  async toggleScreenSharing(streamId = null) {
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
  }

  render() {
    const {
      getRoomUsers,
      roomUsers,
      roomLoading,
      user,
      organizationUsers,
      billing,
      addUserToRoom,
      addUserLoading,
      currentTime,
      isLightMode,
    } = this.props;

    const {
      isCall,
      room,
      room_at_capacity,
      loading,
      publishers,
      publishing,
      screenSharingActive,
      screenSources,
      screenSourcesLoading,
      showScreenSharingModal,
      showScreenSharingDropdown,
      local_stream,
      videoStatus,
      audioStatus,
      videoSizes,
      pinned,
      currentLoadingMessage,
      showAddUserToRoomModal,
      showChatThread,
    } = this.state;

    return (
      <React.Fragment>
        <AddUserToRoomModal
          users={roomUsers}
          organizationUsers={organizationUsers}
          me={user}
          room={room}
          loading={roomLoading.toString() === "true" ?? false}
          addUserLoading={addUserLoading}
          show={showAddUserToRoomModal}
          handleSubmit={addUserToRoom}
          getRoomUsers={getRoomUsers}
          onShow={() => getRoomUsers(room.id)}
          onHide={() => this.setState({ showAddUserToRoomModal: false })}
        />
        <ScreenSharingModal
          sources={screenSources}
          show={showScreenSharingModal}
          loading={screenSourcesLoading}
          handleSubmit={this.toggleScreenSharing}
          onShow={() => this.getAvailableScreensToShare()}
          onHide={() => this.setState({ showScreenSharingModal: false })}
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
                  {room.name}
                </p>
                {room.is_private ? (
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
                  ) : local_stream === null ? (
                    !room_at_capacity ? (
                      <Button
                        variant="link"
                        style={{ whiteSpace: "nowrap" }}
                        className="mx-3 icon-button btn-lg"
                        size="lg"
                        onClick={() => this.startPublishingStream()}
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
                ) : loading || local_stream === null ? (
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
            {local_stream ? (
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
                            onClick={() =>
                              this.setState({
                                showScreenSharingModal: true,
                                screenSourcesLoading: true,
                                showScreenSharingDropdown: false,
                              })
                            }
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
                    onClick={() => this.toggleVideoOrAudio("audio")}
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
                  ) : room.video_enabled ? (
                    <React.Fragment>
                      <Button
                        variant="link"
                        className={
                          "mx-3 icon-button btn-lg ph-no-capture" +
                          (videoStatus ? " text-green" : " text-red")
                        }
                        onClick={() => this.toggleVideoOrAudio("video")}
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
              <center>
                <FontAwesomeIcon
                  icon={faCircleNotch}
                  className="mt-3"
                  style={{ fontSize: "2.4rem", color: "#6772ef" }}
                  spin
                />
              </center>
            </div>
          ) : !room_at_capacity ? (
            <React.Fragment>
              <div
                className={videoSizes.display}
                style={{ overflowY: "scroll" }}
              >
                {publishers.length > 0 ? (
                  <VideoList
                    videoSizes={videoSizes}
                    publishers={publishers}
                    publishing={publishing}
                    currentTime={currentTime}
                    user={user}
                    renderVideo={this.renderVideo}
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
}
