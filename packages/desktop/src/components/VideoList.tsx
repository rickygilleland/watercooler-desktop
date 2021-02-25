import { Publisher, VideoSizes } from "../hooks/room";
import { User } from "../store/types/user";
import { useGetCurrentTime } from "../hooks/team";
import React, { useEffect, useState } from "react";
import Video from "./Video";
import styled from "styled-components";

interface VideoListProps {
  publishing: boolean;
  user: User;
  publishers: Publisher[];
  videoSizes: VideoSizes;
  togglePinned(publisherId: string): void;
  pinnedPublisherId: string | undefined;
  speakingPublishers: string[];
}

export default function VideoList(props: VideoListProps): JSX.Element {
  const {
    publishing,
    user,
    publishers,
    videoSizes,
    togglePinned,
    pinnedPublisherId,
    speakingPublishers,
  } = props;

  const currentTime = useGetCurrentTime(props.user.timezone);

  const [processedPublishers, setProcessedPublishers] = useState<Publisher[]>([
    ...publishers,
  ]);
  const [pinnedPublisher, setPinnedPublisher] = useState<
    Publisher | undefined
  >();
  const [showPinToggle, setShowPinToggle] = useState(false);

  const [videoOnlyPublishers, setVideoOnlyPublishers] = useState<Publisher[]>(
    [],
  );

  useEffect(() => {
    const videoOnlyPublishers = publishers.filter(
      (publisher) => publisher.hasVideo,
    );

    setVideoOnlyPublishers(videoOnlyPublishers);
  }, [publishers]);

  useEffect(() => {
    const pinnedPublisher = processedPublishers.find(
      (publisher) => publisher.id === pinnedPublisherId,
    );
    setPinnedPublisher(pinnedPublisher);
  }, [pinnedPublisherId, processedPublishers]);

  if (pinnedPublisher || showPinToggle) {
    const publisherToShow = pinnedPublisher ?? videoOnlyPublishers[0];

    return (
      <VideoContainer
        gridRows={videoSizes.rows}
        gridColumns={videoSizes.columns}
      >
        <VideoItem gridRows={videoSizes.rows} gridColumns={videoSizes.columns}>
          <Video
            showPinToggle={showPinToggle}
            publisher={publisherToShow}
            togglePinned={togglePinned}
            publishing={publishing}
            speaking={speakingPublishers.includes(publisherToShow.id)}
            currentTime={currentTime}
            localTimezone={user.timezone}
            hasVideo={publisherToShow.hasVideo}
            hasAudio={publisherToShow.hasAudio}
            videoLoading={Boolean(publisherToShow.videoLoading)}
            audioLoading={Boolean(publisherToShow.audioLoading)}
            videoIsFaceOnly={Boolean(publisherToShow.videoIsFaceOnly)}
            showBeforeJoin={
              publisherToShow.id.includes("_screensharing") ? false : true
            }
            pinned={true}
            key={publisherToShow.id}
            isLocal={publisherToShow.member?.id == user.id}
          ></Video>
        </VideoItem>
      </VideoContainer>
    );
  }

  return (
    <VideoContainer gridRows={videoSizes.rows} gridColumns={videoSizes.columns}>
      {videoOnlyPublishers.map((publisher) => {
        return (
          <VideoItem
            gridRows={videoSizes.rows}
            gridColumns={videoSizes.columns}
            key={publisher.id}
          >
            <Video
              showPinToggle={showPinToggle}
              publisher={publisher}
              togglePinned={togglePinned}
              publishing={publishing}
              speaking={speakingPublishers.includes(publisher.id)}
              currentTime={currentTime}
              localTimezone={user.timezone}
              hasVideo={publisher.hasVideo}
              hasAudio={publisher.hasAudio}
              videoLoading={Boolean(publisher.videoLoading)}
              audioLoading={Boolean(publisher.audioLoading)}
              videoIsFaceOnly={Boolean(publisher.videoIsFaceOnly)}
              showBeforeJoin={
                publisher.id.includes("_screensharing") ? false : true
              }
              pinned={false}
              isLocal={publisher.member?.id === user.id}
            ></Video>
          </VideoItem>
        );
      })}
    </VideoContainer>
  );
}

/* sort of working, doesn't scale height well*/
const VideoContainer = styled.div<{
  gridRows: number;
  gridColumns: number;
}>`
  display: grid;
  justify-content: center;
  align-items: center;
  grid-template-columns: repeat(
    ${(props) => props.gridColumns},
    minmax(0, 1fr)
  );
  grid-template-rows: max-content;
  height: calc(100vh - 120px);
  align-content: center;

  @media (max-height: 250px) {
    height: 100vh;
    .shadow {
      box-shadow: none !important;
    }
  }
`;

const VideoItem = styled.div<{
  gridRows: number;
  gridColumns: number;
}>`
  margin: 0 auto;
  height: 100%;
  width: 100%;
  display: flex;
  video {
    max-width: 95vw;
    max-height: calc((100vh - 120px) / ${(props) => props.gridRows});

    @media (max-height: 250px) {
      max-height: 100vh;
    }
  }
`;

/*
const VideoContainer = styled.div`
  display: flex;
  height: calc(100vh - 120px);
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

const VideoItem = styled.div`
  flex: 1 0 auto;
  margin: 10px;

  video {
    max-height: calc(100vh - 120px);
  }
`;*/
