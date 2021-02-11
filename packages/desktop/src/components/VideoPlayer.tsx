import React, { useEffect, useState } from "react";

interface VideoPlayerProps {
  renderVideo: any;
  stream: any;
  publisher: any;
  isLocal: boolean;
  videoIsFaceOnly: boolean;
}

export default function VideoPlayer(props: VideoPlayerProps): JSX.Element {
  const [className, setClassName] = useState("shadow");

  useEffect(() => {
    let className = "shadow";
    if (!props.publisher.id.includes("_screensharing")) {
      className += " video-flip";
    }

    if (props.videoIsFaceOnly) {
      className += " border-radius-round";
    }

    setClassName(className);
  }, [props.publisher.id, props.videoIsFaceOnly]);

  return (
    <video
      autoPlay={true}
      ref={props.renderVideo(props.stream)}
      muted={props.isLocal}
      playsInline={true}
      className={className}
      style={{ height: "100%", width: "100%", borderRadius: 25 }}
    ></video>
  );
}
