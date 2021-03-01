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
import posthog from "posthog-js";

export interface Dimensions {
  width: number;
  height: number;
}

export interface VideoSizes {
  rows: number;
  columns: number;
  height: number;
  width: number;
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
  videoLoading?: boolean;
  audioLoading?: boolean;
  subscribed?: boolean;
}

export interface Member {
  id: number;
  info: {
    room_at_capacity: boolean;
    media_server: string;
    peer_uuid: string;
    streamer_key: string;
    room_pin: string;
    timezone?: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    number_of_publishers?: number;
  };
}

interface WebsocketDataResponse {
  me: Member;
  members: Members;
  triggered_by: number;
}

export interface CanvasElement extends HTMLCanvasElement {
  captureStream(frameRate?: number): MediaStream;
}

interface VideoFrameMetadata {
  presentationTime: DOMHighResTimeStamp;
  expectedDisplayTime: DOMHighResTimeStamp;
  width: number;
  height: number;
  mediaTime: number;
  presentedFrames: number;
  processingDuration?: number;
  captureTime?: DOMHighResTimeStamp;
  receiveTime?: DOMHighResTimeStamp;
  rtpTimestamp?: number;
}
type VideoFrameRequestCallbackId = number;
interface VideoElement extends HTMLVideoElement {
  requestVideoFrameCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (now: DOMHighResTimeStamp, metadata: VideoFrameMetadata) => any,
  ): VideoFrameRequestCallbackId;
  cancelVideoFrameCallback(handle: VideoFrameRequestCallbackId): void;
}

export const useInitializeRoom = (
  roomSlug: string | undefined,
  teams: Team[],
  pusherInstance: Pusher | undefined,
  userId: number | null,
): {
  room: Room | undefined;
  presenceChannel: Channel | undefined;
  setPresenceChannel(channel: Channel | undefined): void;
} => {
  const [room, setRoom] = useState<Room | undefined>();
  const [presenceChannel, setPresenceChannel] = useState<Channel | undefined>();

  useEffect(() => {
    let updatedRoom: Room | undefined;
    let presenceChannel: Channel | undefined;

    for (const team of teams) {
      updatedRoom = team.rooms.find((teamRoom) => teamRoom.slug === roomSlug);
      if (updatedRoom) {
        setRoom(updatedRoom);
        break;
      }
    }

    if (!updatedRoom) {
      return;
    }

    posthog.capture("$pageview", { room_id: updatedRoom.id });

    if (pusherInstance) {
      presenceChannel = pusherInstance.subscribe(
        `presence-room.${updatedRoom.channel_id}`,
      );

      setPresenceChannel(presenceChannel);
    }

    return () => {
      presenceChannel?.unsubscribe();
    };
  }, [teams, roomSlug, pusherInstance, userId]);

  return { room, presenceChannel, setPresenceChannel };
};
export const useInitializeJanus = (): boolean => {
  const [initialized, setInitialized] = useState(false);
  const dependencies = Janus.useDefaultDependencies();

  useEffect(() => {
    Janus.init({
      debug: process.env.NODE_ENV == "production" ? false : true,
      dependencies,
      callback: () => {
        setInitialized(true);
      },
    });
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

export const useGetVideoSizes = (
  showChatThread: boolean,
  publishers: Publisher[],
): VideoSizes => {
  const [videoSizes, setVideoSizes] = useState<VideoSizes>({
    rows: 0,
    columns: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [dimensions, setDimensions] = useState<Dimensions>({
    width: window.innerWidth,
    height: window.innerHeight / 2,
  });

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    setDimensions({
      width,
      height,
    });
  };

  useEffect(() => {
    const publishersCount = publishers.filter((publisher) => publisher.hasVideo)
      .length;

    let width = dimensions.width;
    let height = dimensions.height;
    const maxWidth = dimensions.width;

    let rows = 1;
    let columns = 1;

    if (publishersCount > 0) {
      if (publishersCount >= 2) {
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
      }

      while (
        height * rows > dimensions.height - 250 ||
        width * columns > maxWidth - 100
      ) {
        width = width - 5;
        height = Math.round(width);
      }
      setVideoSizes({
        rows,
        columns,
        width,
        height,
      });

      return;
    }

    setVideoSizes({
      rows: 1,
      columns: 1,
      width,
      height,
    });
  }, [showChatThread, publishers, dimensions]);

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

export const useToggleVideoAudioStatus = (
  localStream: MediaStream | undefined,
  videoStatus: boolean,
  audioStatus: boolean,
  publishers: Publisher[],
  setPublishers: (publishers: Publisher[]) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  videoRoomStreamHandle: any,
  userId: string | undefined,
): void => {
  useEffect(() => {
    const localPublisher = publishers.find(
      (publisher) => publisher.id === userId,
    );

    if (
      !localStream ||
      !localPublisher ||
      (localPublisher.hasAudio === audioStatus &&
        localPublisher.hasVideo === videoStatus)
    ) {
      return;
    }

    const videoStatusUpdated = localPublisher.hasVideo !== videoStatus;
    const audioStatusUpdated = localPublisher.hasAudio !== audioStatus;

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

    if (videoStatusUpdated) {
      videoRoomStreamHandle.data({
        text: JSON.stringify({
          type: "video_toggled",
          publisher_id: userId,
          video_status: videoStatus,
        }),
      });
    }

    if (audioStatusUpdated) {
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
    setPublishers,
  ]);
};

export const useAddMemberDataToPublishers = (
  publishers: Publisher[],
  members: Members | undefined,
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
          publisher.member = {
            id: member.id,
            info: member,
          };
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
          setCurrentWebsocketUser(data.me);
          if (data.me.info?.room_at_capacity) {
            setRoomAtCapacity(true);
            return;
          }

          setMembers(data.members);
          setPeerUuid(data.me.info?.peer_uuid);
          setMediaServer(data.me.info?.media_server);
          setStreamerKey(data.me.info?.streamer_key);
          setRoomPin(data.me.info?.room_pin);
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

export const useCreateVideoContainers = () => {
  const [localVideoContainer] = useState<CanvasElement>(
    <CanvasElement>document.createElement("canvas"),
  );
  const [localVideoCanvasContainer] = useState<CanvasElement>(
    <CanvasElement>document.createElement("canvas"),
  );
  const [localVideoCanvas] = useState<CanvasElement>(
    <CanvasElement>document.createElement("canvas"),
  );
  const [backgroundBlurVideoCanvasCopy] = useState<CanvasElement>(
    <CanvasElement>document.createElement("canvas"),
  );
  const [localVideo] = useState<VideoElement>(
    <VideoElement>document.createElement("video"),
  );

  useEffect(() => {
    return () => {
      localVideoContainer.remove();
      localVideoCanvasContainer.remove();
      localVideoCanvas.remove();
      backgroundBlurVideoCanvasCopy.remove();
      localVideo.remove();
    };
  }, [
    backgroundBlurVideoCanvasCopy,
    localVideo,
    localVideoCanvas,
    localVideoCanvasContainer,
    localVideoContainer,
  ]);

  return {
    localVideoContainer,
    localVideoCanvasContainer,
    localVideoCanvas,
    backgroundBlurVideoCanvasCopy,
    localVideo,
  };
};

export const useCreateHeartbeatIntervals = () => {
  const [heartbeatInterval, setHeartbeatInterval] = useState<
    NodeJS.Timeout | undefined
  >();

  useEffect(() => {
    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    };
  }, [heartbeatInterval]);

  return { setHeartbeatInterval };
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
