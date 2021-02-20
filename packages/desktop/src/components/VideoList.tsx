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
}

export default function VideoList(props: VideoListProps): JSX.Element {
  const {
    publishing,
    user,
    publishers,
    videoSizes,
    togglePinned,
    pinnedPublisherId,
  } = props;

  const currentTime = useGetCurrentTime(props.user.timezone);

  const [processedPublishers, setProcessedPublishers] = useState<Publisher[]>([
    ...publishers,
  ]);
  const [pinnedPublisher, setPinnedPublisher] = useState<
    Publisher | undefined
  >();
  const [showPinToggle, setShowPinToggle] = useState(false);

  useEffect(() => {
    if (processedPublishers.length != publishers.length) {
      return setProcessedPublishers([...publishers]);
    }

    let shouldUpdate = false;

    processedPublishers.forEach((processedPublisher) => {
      publishers.forEach((publisher) => {
        if (publisher.id == processedPublisher.id) {
          shouldUpdate = processedPublisher.hasVideo != publisher.hasVideo;
          shouldUpdate = processedPublisher.hasAudio != publisher.hasAudio;
        }
      });
    });

    if (shouldUpdate) {
      setProcessedPublishers([...publishers]);
    }
  }, [processedPublishers, publishers]);

  useEffect(() => {
    const pinnedPublisher = processedPublishers.find(
      (publisher) => publisher.id === pinnedPublisherId,
    );
    setPinnedPublisher(pinnedPublisher);
  }, [pinnedPublisherId, processedPublishers]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkVideoAudioStatus = (publisher: Publisher): any => {
      let videoLoading = false;
      let audioLoading = false;

      if (typeof publisher.stream != "undefined" && publisher.stream != null) {
        const tracks = publisher.stream.getTracks();

        tracks.forEach(function (track) {
          if (track.kind == "video") {
            videoLoading = track.muted;
          }

          if (track.kind == "audio") {
            audioLoading = track.muted;
          }
        });
      }

      const updatedPublishers = [...processedPublishers];

      updatedPublishers.forEach((updatedPublisher) => {
        if (updatedPublisher.id == publisher.id) {
          updatedPublisher.videoLoading = videoLoading;
          updatedPublisher.audioLoading = audioLoading;
        }
      });

      setProcessedPublishers(updatedPublishers);

      if (publisher.hasVideo && videoLoading) {
        return requestAnimationFrame(checkVideoAudioStatus(publisher));
      }
    };

    for (const publisher of processedPublishers) {
      if (
        typeof publisher.videoLoading === undefined ||
        typeof publisher.audioLoading === undefined
      ) {
        checkVideoAudioStatus(publisher);
      }
    }
  }, [processedPublishers]);

  useEffect(() => {
    setShowPinToggle(Boolean(processedPublishers.length > 1));
  }, [processedPublishers.length]);

  if (pinnedPublisher || showPinToggle) {
    const publisherToShow = pinnedPublisher ?? processedPublishers[0];

    return (
      <VideoContainer
        gridRows={videoSizes.rows}
        gridColumns={videoSizes.columns}
      >
        <VideoItem gridRows={videoSizes.rows} gridColumns={videoSizes.columns}>
          <Video
            showPinToggle={showPinToggle}
            videoSizes={videoSizes}
            publisher={publisherToShow}
            togglePinned={togglePinned}
            publishing={publishing}
            speaking={Boolean(publisherToShow.speaking)}
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
            isLocal={publisherToShow.member?.id == user.id.toString()}
          ></Video>
        </VideoItem>
      </VideoContainer>
    );
  }

  return (
    <VideoContainer gridRows={videoSizes.rows} gridColumns={videoSizes.columns}>
      {processedPublishers.map((publisher) => {
        return (
          <VideoItem
            gridRows={videoSizes.rows}
            gridColumns={videoSizes.columns}
          >
            <Video
              showPinToggle={showPinToggle}
              videoSizes={videoSizes}
              publisher={publisher}
              togglePinned={togglePinned}
              publishing={publishing}
              speaking={Boolean(publisher.speaking)}
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
              key={publisher.id}
              isLocal={publisher.member?.id === user.id.toString()}
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
  grid-template-columns: repeat(${(props) => props.gridColumns}, 1fr);
  grid-template-rows: max-content;
  height: 100%;
`;

const VideoItem = styled.div<{
  gridRows: number;
  gridColumns: number;
}>`
  video {
    width: auto;
    max-height: calc((100vh - 120px) / ${(props) => props.gridRows});
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
