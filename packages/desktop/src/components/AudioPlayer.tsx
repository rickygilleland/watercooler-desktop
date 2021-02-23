import { User } from "../store/types/user";
import { useRenderVideo } from "../hooks/room";
import React from "react";

interface AudioPlayerProps {
  user: User;
  stream: MediaStream;
  publisherId: string;
}

export default function AudioPlayer(props: AudioPlayerProps): JSX.Element {
  const videoRef = useRenderVideo(props.stream);
  return (
    <video
      autoPlay
      muted={props.publisherId === props.user.id.toString()}
      playsInline
      ref={videoRef}
      style={{ height: 0, width: 0 }}
    ></video>
  );
}
