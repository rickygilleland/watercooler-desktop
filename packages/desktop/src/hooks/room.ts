/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Janus } from "janus-gateway";
import { Room } from "../store/types/room";
import { Team } from "../store/types/organization";
import { User } from "../store/types/user";
import { desktopCapturer, ipcRenderer } from "electron";
import { each } from "lodash";
import { useEffect, useRef, useState } from "react";
import Pusher, { Channel, Members } from "pusher-js";
import axios from "axios";
import hark from "hark";
import posthog from "posthog-js";

export interface Dimensions {
  width: number;
  height: number;
}

export interface VideoSizes {
  height: number;
  width: number;
  display: string;
  containerHeight: number;
  threadContainerHeight: number;
  pinnedHeight: number;
  pinnedWidth: number;
  rows: number;
  columns: number;
}

export interface Publisher {
  id: string;
  stream: MediaStream;
  hasVideo: boolean;
  hasAudio: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handle?: any;
  active: boolean;
  videoIsFaceOnly?: boolean;
  speaking?: boolean;
  member?: Member;
  containerBackgroundColor?: string;
  loading?: boolean;
  display: string;
}

export interface Member {
  id: string;
  info: {
    room_at_capacity: boolean;
    media_server: string;
    peer_uuid: string;
    streamer_key: string;
    room_pin: string;
  };
  timezone?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

interface WebsocketDataResponse {
  me: Member;
  members: Members;
  triggered_by: number;
}

export interface CanvasElement extends HTMLCanvasElement {
  captureStream(frameRate?: number): MediaStream;
}

export const useInitializeRoom = (
  roomSlug: string | undefined,
  teams: Team[],
  pusherInstance: Pusher,
  userId: number | null,
): {
  room: Room | undefined;
  team: Team | undefined;
  presenceChannel: Channel | undefined;
  setPresenceChannel(channel: Channel | undefined): void;
} => {
  const [room, setRoom] = useState<Room | undefined>();
  const [team, setTeam] = useState<Team | undefined>();
  const [presenceChannel, setPresenceChannel] = useState<Channel | undefined>();

  useEffect(() => {
    let updatedRoom: Room | undefined;

    for (const team of teams) {
      const updatedRoom = team.rooms.find(
        (teamRoom) => teamRoom.slug === roomSlug,
      );
      if (updatedRoom) {
        setRoom(updatedRoom);
        setTeam(team);
        break;
      }
    }

    if (!updatedRoom) {
      return;
    }

    posthog.capture("$pageview", { room_id: updatedRoom.id });

    const presenceChannel = pusherInstance.subscribe(
      `presence-room.${updatedRoom.channel_id}`,
    );

    setPresenceChannel(presenceChannel);
  }, [teams, roomSlug, pusherInstance, userId]);

  return { room, team, presenceChannel, setPresenceChannel };
};
export const useInitializeJanus = (): boolean => {
  const [initialized, setInitialized] = useState(false);

  Janus.init({
    debug: process.env.NODE_ENV == "production" ? false : true,
    dependencies: Janus.useDefaultDependencies(),
    callback: () => {
      setInitialized(true);
    },
  });

  return initialized;
};

export const useGetAvailableScreensToShare = (
  showScreenSharingModal: boolean,
): {
  availableScreensToShare: Electron.DesktopCapturerSource[];
  screenSourcesLoading: boolean;
} => {
  const [availableScreensToShare, setAvailableScreensToShare] = useState<
    Electron.DesktopCapturerSource[]
  >([]);
  const [screenSourcesLoading, setScreenSourcesLoading] = useState(false);

  useEffect(() => {
    if (!showScreenSharingModal) return;

    setScreenSourcesLoading(true);
    ipcRenderer
      .invoke("get-media-access-status", { mediaType: "screen" })
      .then(async (response: string) => {
        if (response === "granted") {
          const availableScreensToShare: Electron.DesktopCapturerSource[] = [];

          const sources = await desktopCapturer.getSources({
            types: ["window", "screen"],
            thumbnailSize: { width: 1000, height: 1000 },
            fetchWindowIcons: true,
          });

          sources.forEach((source) => {
            if (!source.name.includes("Blab")) {
              let name = source.name;
              if (name.length > 50) {
                name = source.name.slice(0, 49).trim() + "...";
              }
              availableScreensToShare.push({
                ...source,
                name,
              });
            }
          });

          setAvailableScreensToShare(availableScreensToShare);
          setScreenSourcesLoading(false);
        }
      });
  }, [showScreenSharingModal]);

  return { availableScreensToShare, screenSourcesLoading };
};

export const useResizeListener = (): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: window.innerWidth,
    height: window.innerHeight / 2,
  });

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    setDimensions({
      width,
      height,
    });
  };

  return dimensions;
};

export const useGetVideoSizes = (
  dimensions: Dimensions,
  showChatThread: boolean,
  publishersCount: number,
): VideoSizes => {
  const [videoSizes, setVideoSizes] = useState<VideoSizes>({
    height: 0,
    width: 0,
    display: "row align-items-center justify-content-center h-100",
    containerHeight: (window.innerHeight - 114) / 2,
    threadContainerHeight: (window.innerHeight - 114) / 2,
    pinnedHeight: 0,
    pinnedWidth: 0,
    rows: 0,
    columns: 0,
  });

  useEffect(() => {
    let width = dimensions.width;
    let height = dimensions.height;
    const maxWidth = dimensions.width;

    let rows = 1;
    let columns = 1;

    if (publishersCount > 0) {
      if (publishersCount >= 2) {
        if (dimensions.width > 980) {
          if (publishersCount > 2) {
            rows = 2;
          }

          if (publishersCount >= 2 && publishersCount <= 4) {
            columns = 2;
          }

          if (publishersCount > 4 && publishersCount <= 6) {
            columns = 3;
          }

          if (publishersCount > 6 && publishersCount <= 8) {
            columns = 4;
          }

          if (publishersCount > 8 && publishersCount <= 12) {
            rows = 3;
            columns = 4;
          }

          if (publishersCount > 12 && publishersCount <= 16) {
            rows = 4;
            columns = 4;
          }

          if (publishersCount > 16 && publishersCount <= 20) {
            rows = 4;
            columns = 5;
          }

          if (publishersCount > 20 && publishersCount <= 25) {
            rows = 5;
            columns = 5;
          }
        } else {
          if (publishersCount == 2) {
            rows = 2;
          }

          if (publishersCount > 2) {
            columns = 2;
            rows = 2;
          }

          if (publishersCount > 2 && publishersCount <= 4) {
            rows = publishersCount;
            columns = 1;
          }

          if (publishersCount > 4) {
            rows = Math.floor(publishersCount / 2);
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

      setVideoSizes({
        height: height,
        width: width,
        display: display,
        containerHeight: dimensions.height - 75,
        threadContainerHeight: showChatThread ? dimensions.height : 65,
        pinnedHeight,
        pinnedWidth,
        rows,
        columns,
      });

      return;
    }

    setVideoSizes({
      width,
      height,
      display: "row align-items-center justify-content-center h-100",
      containerHeight: dimensions.height - 75,
      threadContainerHeight: showChatThread ? dimensions.height : 65,
      pinnedHeight: height,
      pinnedWidth: width,
      rows: 1,
      columns: 1,
    });
  }, [dimensions, showChatThread, publishersCount]);

  return videoSizes;
};

export const useOnlineListener = (): boolean => {
  const [online, setIsOnline] = useState(true);
  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    ipcRenderer.on("power_update", (_event, arg) => {
      if (arg == "suspend" || arg == "lock-screen") {
        handleOffline;
      }
      if (arg == "unlock-screen" || arg == "resume") {
        handleOnline;
      }
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      ipcRenderer.removeAllListeners("power_update");
    };
  });

  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  return online;
};

export const useGetRootMediaHandle = (
  mediaServer: string | undefined,
  janusInitialized: boolean,
): {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rootMediaHandle: any;
  rootMediaHandleInitialized: boolean;
} => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rootMediaHandle, setRootMediaHandle] = useState<any>();
  const [rootMediaHandleInitialized, setRootMediaHandleInitialized] = useState(
    false,
  );

  useEffect(() => {
    if (!mediaServer || !janusInitialized) {
      return;
    }

    const rootMediaHandle = new Janus({
      server: [`wss://${mediaServer}:4443/`, `https://${mediaServer}/streamer`],
      success: () => {
        setRootMediaHandle(rootMediaHandle);
        setRootMediaHandleInitialized(true);
      },
    });

    return () => {
      try {
        rootMediaHandle.destroy({
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          success: function () {},
        });
      } catch (error) {
        //do something
      }
    };
  }, [mediaServer, janusInitialized]);

  return { rootMediaHandle, rootMediaHandleInitialized };
};

export const useGetMediaHandle = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rootMediaHandle: any,
  rootMediaHandleInitialized: boolean,
  roomChannelId: string | undefined,
  peerUuid: string | undefined,
  streamerKey: string | undefined,
  roomPin: string | undefined,
  publishing: boolean,
  currentWebsocketUser: Member | undefined,
  videoStatus: boolean,
  audioStatus: boolean,
  localStream: MediaStream | undefined,
  userId: string,
): {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  videoRoomStreamHandle: any;
  publishers: Publisher[];
  mediaHandleError: boolean;
  privateId: string | undefined;
  joinedMediaHandle: boolean;
} => {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [subscribedPublishers, setSubscribedPublishers] = useState<string[]>(
    [],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [videoRoomStreamHandle, setVideoRoomStreamHandle] = useState<any>();
  const [mediaHandleError, setMediaHandleError] = useState(false);
  const [privateId, setPrivateId] = useState<string | undefined>();
  const [joinedMediaHandle, setJoinedMediaHandle] = useState(false);

  useEffect(() => {
    if (
      !rootMediaHandle ||
      !peerUuid ||
      !rootMediaHandleInitialized ||
      !roomChannelId ||
      !streamerKey ||
      !roomPin
    ) {
      return;
    }

    rootMediaHandle.attach({
      plugin: "janus.plugin.videoroom",
      opaqueId: peerUuid,
      success: function (videoRoomStreamHandle: {
        send: (arg0: {
          message: {
            request: string;
            room: string;
            ptype: string;
            display: string;
            token: string;
            pin: string;
          };
        }) => void;
      }) {
        setVideoRoomStreamHandle(videoRoomStreamHandle);

        //register a publisher
        const request = {
          request: "join",
          room: roomChannelId,
          ptype: "publisher",
          display: peerUuid,
          token: streamerKey,
          pin: roomPin,
        };

        videoRoomStreamHandle.send({ message: request });
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
          videoRoomStreamHandle.handleRemoteJsep({ jsep: jsep });
        }

        if (msg.videoroom == "joined") {
          setPrivateId(msg.private_id);
          setJoinedMediaHandle(true);
        }

        if (msg.videoroom == "event") {
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

            if (msgToCheck && subscribedPublishers.includes(msgToCheck)) {
              const updatedSubscribedPublishers = subscribedPublishers.filter(
                (id) => id === msgToCheck,
              );
              setSubscribedPublishers(updatedSubscribedPublishers);
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
        setJoinedMediaHandle(false);
        setVideoRoomStreamHandle(undefined);
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      destroyed: function () {
        setJoinedMediaHandle(false);
        setVideoRoomStreamHandle(undefined);
      },
    });
  }, [
    peerUuid,
    rootMediaHandle,
    videoRoomStreamHandle,
    rootMediaHandleInitialized,
    roomChannelId,
    streamerKey,
    roomPin,
    publishers,
    subscribedPublishers,
  ]);

  useEffect(() => {
    if (!localStream || !currentWebsocketUser) {
      return;
    }
    if (publishing) {
      const isCurrentPublisher = publishers.find(
        (publisher) => publisher.id === currentWebsocketUser.id,
      );

      if (isCurrentPublisher) {
        const updatedPublishers = publishers.map((publisher) => {
          publisher.hasVideo = videoStatus;
          publisher.hasAudio = audioStatus;

          return publisher;
        });
        setPublishers(updatedPublishers);
        return;
      }

      setPublishers([
        ...publishers,
        {
          member: currentWebsocketUser,
          hasVideo: videoStatus,
          hasAudio: audioStatus,
          id: currentWebsocketUser.id.toString(),
          stream: localStream,
          active: true,
          display: currentWebsocketUser.id.toString(),
        },
      ]);
    } else {
      const updatedPublishers = publishers.filter(
        (publisher) => publisher.id !== currentWebsocketUser.id,
      );
      setPublishers(updatedPublishers);
    }
  }, [
    publishing,
    audioStatus,
    videoStatus,
    currentWebsocketUser,
    localStream,
    publishers,
  ]);

  useEffect(() => {
    if (
      !peerUuid ||
      !streamerKey ||
      !privateId ||
      !publishing ||
      !roomChannelId
    ) {
      return;
    }

    const unsubscribedRemotePublishers = publishers.filter(
      (publisher) =>
        publisher.id !== userId && !subscribedPublishers.includes(publisher.id),
    );

    for (const publisher of unsubscribedRemotePublishers) {
      let handle: {
        createAnswer: (arg0: {
          jsep: string;
          media: { audioSend: boolean; videoSend: boolean; data: boolean };
          success: (jsep: string) => void;
        }) => void;
        send: (arg0: {
          message: { request: string; room: string };
          jsep: string;
        }) => void;
      };

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
          //subscribe to the feed
          const request = {
            request: "join",
            room: roomChannelId,
            ptype: "subscriber",
            display: peerUuid,
            token: streamerKey,
            feed: publisher.id,
            private_id: privateId,
          };

          remoteHandle.send({ message: request });
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
          setSubscribedPublishers([
            ...new Set([...subscribedPublishers, publisher.id]),
          ]);

          const updatedPublishers = publishers.map((publisherToUpdate) => {
            if (publisherToUpdate.display === publisher.display) {
              publisherToUpdate.stream = remote_stream;
              publisherToUpdate.hasVideo = publisher.id.includes(
                "_screensharing",
              );
              publisherToUpdate.hasAudio = true;
              publisherToUpdate.active = true;
            }

            return publisherToUpdate;
          });

          setPublishers(updatedPublishers);
        },
        ondataopen: function () {
          const dataMsg = {
            type: "initial_video_audio_status",
            publisher_id: userId,
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
            dataMsg.requesting_publisher_id !== userId
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

          if (dataMsg.type === "initial_video_audio_status") {
            const dataMsgResponse = {
              type: "initial_video_audio_status_response",
              publisher_id: userId,
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
    publishing,
    roomChannelId,
    rootMediaHandle,
    streamerKey,
    subscribedPublishers,
    userId,
    videoRoomStreamHandle,
    videoStatus,
  ]);

  //handle video/audio toggles
  useEffect(() => {
    if (localStream) {
      localStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = videoStatus));
      localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = audioStatus));

      const updatedPublishers = publishers.map((publisher) => {
        if (publisher.id === userId) {
          publisher.hasAudio = audioStatus;
          publisher.hasVideo = videoStatus;
        }
        return publisher;
      });

      setPublishers(updatedPublishers);

      videoRoomStreamHandle.data({
        text: JSON.stringify({
          type: "video_toggled",
          publisher_id: userId,
          video_status: videoStatus,
        }),
      });

      videoRoomStreamHandle.data({
        text: JSON.stringify({
          type: "audio_toggled",
          publisher_id: userId,
          audio_status: audioStatus,
        }),
      });
    }
  }, [
    videoStatus,
    audioStatus,
    localStream,
    publishers,
    userId,
    videoRoomStreamHandle,
  ]);

  //cleanup after stop publishing
  useEffect(() => {
    if (!publishing && publishers && localStream) {
      const request = {
        request: "unpublish",
      };

      videoRoomStreamHandle.send({ message: request });

      localStream.getTracks().forEach((track) => track.stop());

      for (const publisher of publishers) {
        if (publisher.active) {
          publisher.handle.detach();
        }
      }

      setPublishers([]);
    }
  }, [publishing, publishers, localStream, videoRoomStreamHandle]);

  return {
    videoRoomStreamHandle,
    publishers,
    mediaHandleError,
    privateId,
    joinedMediaHandle,
  };
};

export const useAddMemberDataToPublishers = (
  publishers: Publisher[],
  members: Members | undefined,
  speakingPublishers: string[],
) => {
  const [publishersWithMembersData, setPublishersWithMembersData] = useState<
    Publisher[]
  >([]);
  const [containerBackgroundColors] = useState<string[]>([
    "#4381ff",
    "#4F4581",
    "#6936e3",
    "#e69a5a",
    "#205444",
    "#00DBD7",
  ]);

  useEffect(() => {
    const publishersWithMembersData = publishers.map((publisher) => {
      if (!publisher.containerBackgroundColor) {
        const rand = Math.floor(
          Math.random() * containerBackgroundColors.length,
        );
        publisher.containerBackgroundColor = containerBackgroundColors[rand];
      }

      if (typeof publisher.loading === "undefined") {
        publisher.loading = false;
      }

      each(members, function (member) {
        if (member.peer_uuid == publisher.display) {
          publisher.member = member;
        }
      });

      return publisher;
    });

    const publisherIds = publishers.map((publisher) => publisher.id);

    const filteredPublishersWithMembersData = publishersWithMembersData.filter(
      (publisher, index) => {
        return publisherIds.indexOf(publisher.id) === index;
      },
    );

    setPublishersWithMembersData(filteredPublishersWithMembersData);
  }, [publishers, members, containerBackgroundColors]);

  useEffect(() => {
    if (speakingPublishers.length > 0) {
      const updatedPublishersWithMembersData = publishersWithMembersData.map(
        (publisher) => {
          publisher.speaking = speakingPublishers.includes(publisher.id);

          return publisher;
        },
      );

      setPublishersWithMembersData(updatedPublishersWithMembersData);
    }
  }, [publishersWithMembersData, speakingPublishers]);

  return publishersWithMembersData;
};

export const useBindPresenceChannelEvents = (
  presenceChannel: Channel | undefined,
  roomId: number | undefined,
  userId: number,
): {
  roomAtCapacity: boolean;
  members: Members | undefined;
  mediaServer: string | undefined;
  peerUuid: string | undefined;
  streamerKey: string | undefined;
  roomPin: string | undefined;
  roomServerUpdated: boolean;
  currentWebsocketUser: Member | undefined;
} => {
  const [roomAtCapacity, setRoomAtCapacity] = useState(false);
  const [members, setMembers] = useState<Members | undefined>();
  const [mediaServer, setMediaServer] = useState<string | undefined>();
  const [peerUuid, setPeerUuid] = useState<string | undefined>();
  const [streamerKey, setStreamerKey] = useState<string | undefined>();
  const [roomPin, setRoomPin] = useState<string | undefined>();
  const [roomServerUpdated, setRoomServerUpdated] = useState(false);
  const [currentWebsocketUser, setCurrentWebsocketUser] = useState<
    Member | undefined
  >();

  useEffect(() => {
    if (presenceChannel && roomId) {
      presenceChannel.bind_global(function (
        event: string,
        data: WebsocketDataResponse,
      ) {
        if (event == "pusher:subscription_succeeded") {
          if (data.me.info.room_at_capacity) {
            setCurrentWebsocketUser(data.me);
            setRoomAtCapacity(true);
            return;
          }

          setMembers(data.members);
          setPeerUuid(data.me.info.peer_uuid);
          setMediaServer(data.me.info.media_server);
          setStreamerKey(data.me.info.streamer_key);
          setRoomPin(data.me.info.room_pin);
        }

        if (event == "room.user.invited") {
          //getRoomUsers(room.id);
        }

        if (event == "room.server.updated" && data.triggered_by != userId) {
          setRoomServerUpdated(true);
        }
      });
    }

    return () => {
      if (presenceChannel) {
        presenceChannel.unbind();
      }
    };
  }, [presenceChannel, roomId, userId]);

  return {
    roomAtCapacity,
    members,
    mediaServer,
    peerUuid,
    streamerKey,
    roomPin,
    roomServerUpdated,
    currentWebsocketUser,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useStartPublishingStream = (
  rawLocalStream: MediaStream | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  videoRoomStreamHandle: any,
  userId: string,
  videoStatus: boolean,
  audioStatus: boolean,
): {
  localStream: MediaStream | undefined;
  speakingPublishers: string[];
  publishing: boolean;
} => {
  const localVideoContainer = useRef<CanvasElement>(null);
  const localVideoCanvasContainer = useRef<CanvasElement>(null);
  const localVideoCanvas = useRef<CanvasElement>(null);
  const backgroundBlurVideoCanvasCopy = useRef<CanvasElement>(null);
  const localVideo = useRef<HTMLVideoElement>(null);

  const [speakingPublishers, setSpeakingPublishers] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | undefined>();

  const [heartbeatInterval, setHeartbeatInterval] = useState<
    NodeJS.Timeout | undefined
  >();

  useEffect(() => {
    if (
      !rawLocalStream ||
      !localVideoContainer.current ||
      !localVideoCanvasContainer.current ||
      !localVideoCanvas.current ||
      !backgroundBlurVideoCanvasCopy.current ||
      !localVideo.current
    ) {
      return;
    }

    const publishStream = async () => {
      if (
        !rawLocalStream ||
        !localVideoContainer.current ||
        !localVideoCanvasContainer.current ||
        !localVideoCanvas.current ||
        !backgroundBlurVideoCanvasCopy.current
      ) {
        return;
      }

      const localStream = localVideoCanvas.current.captureStream(60);

      rawLocalStream
        .getAudioTracks()
        .forEach((track) => localStream.addTrack(track));

      const speechEvents = hark(localStream);

      speechEvents.on("speaking", function () {
        setSpeakingPublishers([...new Set([...speakingPublishers, userId])]);

        const dataMsg = {
          type: "started_speaking",
          publisher_id: userId,
        };

        videoRoomStreamHandle.data({
          text: JSON.stringify(dataMsg),
        });
      });

      speechEvents.on("stopped_speaking", function () {
        const dataMsg = {
          type: "stopped_speaking",
          publisher_id: userId,
        };

        videoRoomStreamHandle.data({
          text: JSON.stringify(dataMsg),
        });

        const updatedSpeakingPublishers = speakingPublishers.filter(
          (speakingId) => speakingId !== userId,
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
        },
      });
    };

    localVideo.current.srcObject = rawLocalStream;
    localVideo.current.muted = true;
    localVideo.current.autoplay = true;
    localVideo.current.setAttribute("playsinline", "");
    localVideo.current.play();

    localVideo.current.onloadedmetadata = () => {
      if (localVideo.current) {
        localVideo.current.width = localVideo.current.videoWidth;
        localVideo.current.height = localVideo.current.videoHeight;
      }
    };

    localVideo.current.onplaying = async () => {
      publishStream();
    };
  }, [rawLocalStream, speakingPublishers, userId, videoRoomStreamHandle]);

  useEffect(() => {
    if (publishing && !heartbeatInterval) {
      const heartbeatInterval = setInterval(() => {
        const dataMsg = {
          type: "participant_status_update",
          publisher_id: userId,
          video_status: videoStatus,
          audio_status: audioStatus,
          face_only_status: false,
        };

        videoRoomStreamHandle.data({
          text: JSON.stringify(dataMsg),
        });
      }, 30000);

      setHeartbeatInterval(heartbeatInterval);
    }

    if (!publishing && heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }

    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    };
  }, [
    publishing,
    videoStatus,
    audioStatus,
    userId,
    videoRoomStreamHandle,
    heartbeatInterval,
  ]);

  return { localStream, speakingPublishers, publishing };
};

export const useRenderVideo = (source: MediaStream) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current !== null) {
      videoRef.current.srcObject = source;
    }
  }, [videoRef, source]);

  return videoRef;
};

export const useGetRoomUsers = (
  roomId: number | undefined,
  authKey: string | null,
): User[] => {
  const [roomUsers, setRoomUsers] = useState<User[]>([]);

  useEffect(() => {
    const getRoomUsers = async () => {
      try {
        const roomUsersResponse: {
          data: User[];
        } = await axios.get(`https://blab.to/api/room/${roomId}/users`, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + authKey,
          },
        });

        setRoomUsers(roomUsersResponse.data);
      } catch (error) {
        //
      }
    };

    if (roomId && authKey !== null) {
      getRoomUsers();
    }
  }, [roomId, authKey]);

  return roomUsers;
};
