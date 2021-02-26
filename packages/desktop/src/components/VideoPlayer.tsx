import { Publisher } from "../hooks/room";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import styled from "styled-components";

interface VideoPlayerProps {
  stream: MediaStream;
  publisher: Publisher;
  isLocal: boolean;
  videoIsFaceOnly: boolean;
  speaking: boolean;
}

export default function VideoPlayer(props: VideoPlayerProps): JSX.Element {
  const [className, setClassName] = useState("");

  useEffect(() => {
    let className = "";
    if (!props.publisher.id.includes("_screensharing")) {
      className += " video-flip";
    }

    if (props.videoIsFaceOnly) {
      className += " border-radius-round";
    }

    if (props.speaking) {
      className += " speaking-border";
    }

    setClassName(className);
  }, [props.publisher.id, props.videoIsFaceOnly, props.speaking]);

  return (
    <Player
      url={props.stream}
      controls={false}
      muted={props.isLocal}
      className={className}
      style={{ borderRadius: 25 }}
      playing={true}
      playsinline={true}
      width="auto"
      height="auto"
    />
  );
}

const Player = styled(ReactPlayer)`
  transform: rotateY(180deg);
  border-radius: 25px;
`;
