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
import React from "react";

class ScreenShareControls extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      audioStatus: true,
      videoStatus: false,
      videoEnabled: false,
    };
  }

  componentDidMount() {
    ipcRenderer.invoke("update-screen-sharing-controls", { initial: true });

    ipcRenderer.on("update-screen-sharing-controls", (event, args) => {
      this.setState({
        audioStatus: args.audioStatus,
        videoStatus: args.videoStatus,
        videoEnabled: args.videoEnabled,
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {}

  toggleScreenSharing() {
    ipcRenderer.invoke("update-screen-sharing-controls", {
      toggleScreenSharing: true,
    });
  }

  toggleVideoOrAudio(type) {
    ipcRenderer.invoke("update-screen-sharing-controls", {
      toggleVideoOrAudio: type,
    });
  }

  leaveRoom() {
    ipcRenderer.invoke("update-screen-sharing-controls", { leaveRoom: true });
  }

  render() {
    const { videoStatus, audioStatus, videoEnabled } = this.state;

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
            onClick={() => this.toggleScreenSharing()}
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
            onClick={() => this.toggleVideoOrAudio("audio")}
          >
            <FontAwesomeIcon
              icon={audioStatus ? faMicrophone : faMicrophoneSlash}
            />{" "}
          </Button>
        </div>
        <div className="align-self-center">
          {videoEnabled ? (
            <Button
              variant={videoStatus ? "outline-success" : "outline-danger"}
              className="mx-1"
              size="sm"
              onClick={() => this.toggleVideoOrAudio("video")}
            >
              <FontAwesomeIcon icon={videoStatus ? faVideo : faVideoSlash} />
            </Button>
          ) : (
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
                  <FontAwesomeIcon
                    icon={videoStatus ? faVideo : faVideoSlash}
                  />
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
            <FontAwesomeIcon
              icon={faDoorClosed}
              onClick={() => this.leaveRoom()}
            />
          </Button>
        </div>
      </div>
    );
  }
}

export default ScreenShareControls;
