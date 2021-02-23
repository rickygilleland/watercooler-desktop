import { Button, Col, Image, Row } from "react-bootstrap";
import { DateTime } from "luxon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Publisher } from "../hooks/room";
import {
  faCircleNotch,
  faCompress,
  faExpand,
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import VideoPlayer from "./VideoPlayer";
import styled from "styled-components";

interface VideoProps {
  showPinToggle: boolean;
  showBeforeJoin: boolean;
  publisher: Publisher;
  localTimezone: string;
  currentTime: DateTime;
  publishing: boolean;
  speaking: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  audioLoading: boolean;
  videoLoading: boolean;
  videoIsFaceOnly: boolean;
  togglePinned(publisherId: string): void;
  pinned: boolean;
  isLocal: boolean;
}

export default function Video(props: VideoProps): JSX.Element {
  const {
    showPinToggle,
    publisher,
    localTimezone,
    currentTime,
    speaking,
    hasVideo,
    videoLoading,
    videoIsFaceOnly,
    togglePinned,
    pinned,
    isLocal,
    hasAudio,
  } = props;

  if (typeof publisher.stream != "undefined" && publisher.stream != null) {
    if (hasVideo === true && !videoLoading) {
      return (
        <div
          className={`video-container mx-auto position-relative text-light`}
          style={{
            borderRadius: 25,
          }}
        >
          <VideoPlayer
            isLocal={isLocal}
            stream={publisher.stream}
            publisher={publisher}
            videoIsFaceOnly={videoIsFaceOnly}
            speaking={speaking}
          />
          <div
            className="position-absolute overlay"
            style={{ top: 8, width: "100%" }}
          >
            {publisher.member?.info?.timezone != null &&
              publisher.member?.info.timezone != localTimezone && (
                <p
                  className="pl-2 mb-1 mt-1 font-weight-bolder"
                  style={{ fontSize: "1.1rem" }}
                >
                  <span
                    style={{
                      backgroundColor: "rgb(18, 20, 34, .5)",
                      borderRadius: 15,
                      padding: ".6rem",
                    }}
                  >
                    {currentTime
                      .setZone(publisher.member.info.timezone)
                      .toLocaleString(DateTime.TIME_SIMPLE)}
                  </span>
                </p>
              )}
          </div>
          <div
            className="position-absolute hide-overlay"
            style={{ bottom: 8, width: "100%" }}
          >
            <Row>
              <Col>
                {!hasAudio && (
                  <p
                    className="pl-2 mb-1 mt-1 font-weight-bolder"
                    style={{ fontSize: "1.1rem" }}
                  >
                    <span
                      style={{
                        backgroundColor: "rgb(18, 20, 34, .5)",
                        borderRadius: 15,
                        padding: ".6rem",
                      }}
                    >
                      <FontAwesomeIcon
                        style={{ color: "#f9426c", fontSize: ".95rem" }}
                        icon={faMicrophoneSlash}
                      />
                    </span>
                  </p>
                )}
              </Col>
            </Row>
          </div>
          <div
            className="position-absolute overlay"
            style={{ bottom: 8, width: "100%" }}
          >
            <Row>
              <Col>
                <p
                  className="pl-2 mb-1 mt-1 font-weight-bolder"
                  style={{ fontSize: "1.1rem" }}
                >
                  <span
                    style={{
                      backgroundColor: "rgb(18, 20, 34, .5)",
                      borderRadius: 15,
                      padding: ".6rem",
                    }}
                  >
                    {publisher.id.includes("_screensharing")
                      ? publisher.member?.info?.first_name + "'s Screen"
                      : publisher.member?.info?.first_name}

                    {hasAudio ? (
                      <FontAwesomeIcon
                        style={{
                          color: "#2eb97b",
                          fontSize: ".95rem",
                          marginLeft: ".35rem",
                        }}
                        icon={faMicrophone}
                      />
                    ) : (
                      <FontAwesomeIcon
                        style={{
                          color: "#f9426c",
                          fontSize: ".95rem",
                          marginLeft: ".35rem",
                        }}
                        icon={faMicrophoneSlash}
                      />
                    )}
                  </span>
                </p>
              </Col>
              <Col>
                {/*<p className="pr-2 mb-1 mt-1 font-weight-bolder text-right">
                                        <span className="p-2 rounded" style={{backgroundColor:"rgb(18, 20, 34, .5)"}}>
                                            {hasAudio
                                                ?
                                                    <FontAwesomeIcon style={{color:"#2eb97b"}} icon={faMicrophone} />
                                                :
                                                    <FontAwesomeIcon style={{color:"#f9426c"}} icon={faMicrophoneSlash} />
                                            }
                                        </span>
                                    </p>*/}
                {showPinToggle &&
                  (pinned ? (
                    <Button
                      variant="dark"
                      className="float-right mb-1 mr-2 toggle-pinned-btn border-0"
                      onClick={() => togglePinned(publisher.id)}
                    >
                      <FontAwesomeIcon icon={faCompress} />
                    </Button>
                  ) : (
                    <Button
                      variant="dark"
                      className="float-right mb-1 mr-2 toggle-pinned-btn border-0"
                      onClick={() => togglePinned(publisher.id)}
                    >
                      <FontAwesomeIcon icon={faExpand} />
                    </Button>
                  ))}
              </Col>
            </Row>
          </div>
        </div>
      );
    }
  }

  return <React.Fragment></React.Fragment>;
}
