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

    setClassName(className);
  }, [props.publisher.id, props.videoIsFaceOnly]);

  return (
    <PlayerWrapper hasGreenBorder={props.speaking}>
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
    </PlayerWrapper>
  );
}

export const PlayerWrapper = styled.div<{
  hasGreenBorder?: boolean;
  hasRedBorder?: boolean;
}>`
  border-radius: 25px;

  video {
    border: ${(props) =>
      props.hasGreenBorder
        ? "2px solid rgb(51, 255, 119, .95)"
        : props.hasRedBorder
        ? "2px solid #f9426c"
        : "2px solid rgb(0, 0, 0, .15)"};

    transition: border 0.3s ease-in-out;
  }
`;

const Player = styled(ReactPlayer)`
  transform: rotateY(180deg);
`;
