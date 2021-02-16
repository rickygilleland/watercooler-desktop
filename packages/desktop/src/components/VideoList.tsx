import { Publisher, VideoSizes } from "../hooks/room";
import { User } from "../store/types/user";
import { useGetCurrentTime } from "../hooks/team";
import React, { useEffect, useState } from "react";
import Video from "./Video";

interface VideoListProps {
  publishing: boolean;
  user: User;
  publishers: Publisher[];
  videoSizes: VideoSizes;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  togglePinned: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pinned: any;
}

export default function VideoList(props: VideoListProps): JSX.Element {
  const {
    publishing,
    user,
    publishers,
    videoSizes,
    togglePinned,
    pinned,
  } = props;

  const currentTime = useGetCurrentTime(props.user.timezone);

  const [processedPublishers, setProcessedPublishers] = useState<Publisher[]>([
    ...publishers,
  ]);

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

  let showPinToggle = false;
  if (processedPublishers.length > 1) {
    showPinToggle = true;
  }

  if (pinned !== false || !showPinToggle) {
    let publisher = processedPublishers[0];
    if (pinned !== false) {
      publisher = processedPublishers[pinned];
    }

    return (
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
        showBeforeJoin={publisher.id.includes("_screensharing") ? false : true}
        pinned={true}
        key={publisher.id}
        isLocal={publisher.member?.id == user.id.toString()}
      ></Video>
    );
  }

  return (
    <React.Fragment>
      {processedPublishers.map((publisher) => {
        return (
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
        );
      })}
    </React.Fragment>
  );
}
