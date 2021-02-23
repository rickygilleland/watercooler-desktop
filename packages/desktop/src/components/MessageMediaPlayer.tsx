/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import ReactPlayer from "react-player";

export enum MediaType {
  Video = "video/mp4",
  Audio = "audio/wav",
}

interface MessageMediaPlayerProps {
  id?: string;
  autoplay: boolean;
  controls: any;
  mediaType: MediaType;
  muted: boolean;
  thumbnail?: string;
  source: any;
}

export default function MessageMediaPlayer(
  props: MessageMediaPlayerProps,
): JSX.Element {
  return (
    <div
      className={
        props.mediaType == "video/mp4"
          ? "react-video-player-wrapper"
          : "react-audio-player-wrapper"
      }
    >
      <ReactPlayer
        url={props.source}
        controls={props.controls}
        playing={props.autoplay}
        muted={props.muted}
        config={{
          file: {
            forceVideo: props.mediaType === MediaType.Video,
            forceAudio: props.mediaType === MediaType.Audio,
            attributes: {
              controlsList: "nodownload",
            },
          },
        }}
        height="100%"
        width="100%"
        poster={props.mediaType == "video/mp4" ? props.thumbnail : undefined}
        className="mx-auto react-player"
      />
    </div>
  );
}
