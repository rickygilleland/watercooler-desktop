import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDesktop,
  faDoorClosed,
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
} from "@fortawesome/free-solid-svg-icons";
import { ipcRenderer } from "electron";
import React, { useEffect, useState } from "react";

export default function ScreenShareControls(): JSX.Element {
  const [audioStatus, setAudioStatus] = useState(true);
  const [videoStatus, setVideoStatus] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);

  useEffect(() => {
    ipcRenderer.invoke("update-screen-sharing-controls", { initial: true });

    ipcRenderer.on("update-screen-sharing-controls", (event, args) => {
      setAudioStatus(args.audioStatus);
      setVideoStatus(args.videoStatus);
      setVideoEnabled(args.videoEnabled);
    });

    return () => {
      ipcRenderer.removeAllListeners("update-screen-sharing-controls");
    };
  }, []);

  const toggleScreenSharing = () => {
    ipcRenderer.invoke("update-screen-sharing-controls", {
      toggleScreenSharing: true,
    });
  };

  const toggleVideoOrAudio = (type: string) => {
    ipcRenderer.invoke("update-screen-sharing-controls", {
      toggleVideoOrAudio: type,
    });
  };

  const leaveRoom = () => {
    ipcRenderer.invoke("update-screen-sharing-controls", { leaveRoom: true });
  };

  return (
    <div
      className="d-flex flex-column justify-content-center vh-100 screen-sharing-controls"
      style={{ backgroundColor: "#121422" }}
    >
      <div className="align-self-center">
        <Button
          variant="outline-danger"
          style={{ whiteSpace: "nowrap" }}
          className="mx-1"
          size="sm"
          onClick={() => toggleScreenSharing()}
        >
          <FontAwesomeIcon icon={faDesktop} />
        </Button>
      </div>
      <div className="align-self-center">
        <Button
          variant={audioStatus ? "outline-success" : "outline-danger"}
          style={{ whiteSpace: "nowrap" }}
          className="mx-1"
          size="sm"
          onClick={() => toggleVideoOrAudio("audio")}
        >
          <FontAwesomeIcon
            icon={audioStatus ? faMicrophone : faMicrophoneSlash}
          />{" "}
        </Button>
      </div>
      <div className="align-self-center">
        {videoEnabled && (
          <Button
            variant={videoStatus ? "outline-success" : "outline-danger"}
            className="mx-1"
            size="sm"
            onClick={() => toggleVideoOrAudio("video")}
          >
            <FontAwesomeIcon icon={videoStatus ? faVideo : faVideoSlash} />
          </Button>
        )}
        {!videoEnabled && (
          <OverlayTrigger
            placement="bottom-start"
            overlay={
              <Tooltip id="tooltip-disabled">
                Video is disabled in this room.
              </Tooltip>
            }
          >
            <span className="d-inline-block">
              <Button
                variant={videoStatus ? "outline-success" : "outline-danger"}
                className="mx-1"
                disabled
                style={{ pointerEvents: "none" }}
              >
                <FontAwesomeIcon icon={videoStatus ? faVideo : faVideoSlash} />
              </Button>
            </span>
          </OverlayTrigger>
        )}
      </div>
      <div className="align-self-center">
        <Button
          variant="outline-danger"
          style={{ whiteSpace: "nowrap" }}
          className="mx-1"
          size="sm"
        >
          <FontAwesomeIcon icon={faDoorClosed} onClick={() => leaveRoom()} />
        </Button>
      </div>
    </div>
  );
}
