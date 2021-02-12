import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { DateTime } from "luxon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsFromRedux } from "../containers/LibraryPage";
import { RouteComponentProps } from "react-router";
import {
  faCircleNotch,
  faClipboard,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import MessageMediaPlayer from "./MessageMediaPlayer";
import React, { useEffect, useRef, useState } from "react";
import SendMessage from "./SendMessage";

interface LibraryProps extends PropsFromRedux, RouteComponentProps {
  isLightMode: boolean;
}

export default function Library(props: LibraryProps): JSX.Element {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const itemsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    props.getLibraryItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.libraryItemCreating) {
      scrollToTop();
    }
  }, [props.libraryItemCreating]);

  const scrollToTop = () => {
    if (itemsContainerRef) {
      setTimeout(() => {
        itemsContainerRef.current.scrollTop;
      }, 50);
    }
  };

  return (
    <div
      className="d-flex flex-column"
      style={{
        height:
          process.env.REACT_APP_PLATFORM == "web"
            ? "calc(100vh - 30px)"
            : "calc(100vh - 22px)",
      }}
    >
      <Row className="pl-0 ml-0" style={{ height: 80 }}>
        <Col xs={{ span: 4 }}>
          <div className="d-flex flex-row justify-content-start">
            <div className="align-self-center">
              <p
                style={{ fontWeight: "bolder", fontSize: "1.65rem" }}
                className="pb-0 mb-0"
              >
                Library
                {props.libraryLoading && (
                  <FontAwesomeIcon
                    icon={faCircleNotch}
                    style={{
                      color: "#6772ef",
                      marginLeft: 10,
                      marginTop: -2,
                      verticalAlign: "middle",
                      fontSize: ".8rem",
                    }}
                    spin
                  />
                )}
              </p>
            </div>
            <div style={{ height: 80 }}></div>
          </div>
        </Col>
        <Col xs={{ span: 4, offset: 4 }}></Col>
      </Row>
      <Container style={{ overflowY: "scroll" }} ref={itemsContainerRef} fluid>
        {props.libraryLoading && props.libraryItemsOrder.length == 0 && (
          <div style={{ marginTop: "4rem" }}>
            <Row className="mt-3 mb-4">
              <Col xs={{ span: 12 }} className="text-center">
                <h1>Loading Library...</h1>
                <FontAwesomeIcon
                  icon={faCircleNotch}
                  className="mt-3 mx-auto"
                  style={{ fontSize: "2.4rem", color: "#6772ef" }}
                  spin
                />
              </Col>
            </Row>
          </div>
        )}
        {!props.libraryLoading && props.libraryItemsOrder.length == 0 && (
          <div style={{ marginTop: "4rem" }}>
            <Row className="mt-3 mb-4">
              <Col xs={{ span: 12 }} className="text-center">
                <h1>Your library is empty.</h1>
                <p>
                  Record your first audio or video Blab now and we'll store here
                  for later.
                </p>
              </Col>
            </Row>
          </div>
        )}
        {props.libraryItemCreating && (
          <p
            className="text-center"
            style={{ fontWeight: 700, fontSize: ".9rem" }}
          >
            Uploading The Blab to Your Library...{" "}
            <FontAwesomeIcon
              icon={faCircleNotch}
              style={{ color: "#6772ef" }}
              spin
            />
          </p>
        )}
        {props.libraryItemsOrder.length > 0 && (
          <Row>
            {props.libraryItemsOrder.map((itemId) => {
              const item = props.libraryItems[itemId];

              if (!item || item === null) {
                return null;
              }

              const date = DateTime.fromISO(item.created_at);
              let formattedDate = date.toRelativeCalendar();

              if (DateTime.local().minus({ days: 7 }) > date) {
                formattedDate = date.toLocaleString(DateTime.DATE_FULL);
              }

              return (
                <Col
                  xs={{ span: 12 }}
                  md={{ span: 6 }}
                  xl={{ span: 4 }}
                  className="d-flex align-items-stretch"
                  key={item.id}
                >
                  <Card
                    className="w-100 m-2 shadow-sm"
                    style={{
                      backgroundColor: !props.isLightMode
                        ? "rgba(27, 30, 47, 0.5)"
                        : undefined,
                      border: !props.isLightMode
                        ? "1px solid rgba(1, 1, 1, 0.35)"
                        : undefined,
                    }}
                  >
                    <Card.Body>
                      {item.attachments.length > 0 &&
                        item.attachments[0].processed == true && (
                          <div className="mt-3">
                            <MessageMediaPlayer
                              autoplay={false}
                              controls={true}
                              source={item.attachments[0].temporary_url}
                              mediaType={item.attachments[0].mime_type}
                              thumbnail={item.attachments[0].thumbnail_url}
                              muted={false}
                              id={`video_player_${item.id}`}
                            />
                          </div>
                        )}
                      {item.attachments[0].processed == false && (
                        <p
                          style={{
                            paddingTop: 15,
                            fontWeight: 700,
                            marginBottom: 0,
                          }}
                        >
                          Video Processing{" "}
                          <FontAwesomeIcon
                            icon={faCircleNotch}
                            style={{ color: "#6772ef" }}
                            spin
                          />
                          <br />
                          <small>
                            The video will appear here automatically shortly...
                          </small>
                        </p>
                      )}
                      <Row style={{ marginLeft: 0, marginTop: 5 }}>
                        <p
                          style={{
                            paddingLeft:
                              item.attachments[0].processed == true ? 5 : 0,
                            marginTop: 10,
                          }}
                        >
                          <span
                            className={
                              "" + (props.isLightMode ? " text-muted" : "")
                            }
                            style={{
                              fontSize: ".75rem",
                              textTransform: "capitalize",
                              fontWeight: 600,
                            }}
                          >
                            {formattedDate}
                          </span>
                        </p>
                        {item.public_url && (
                          <CopyToClipboard
                            text={item.public_url}
                            onCopy={() => {
                              setCopiedId(item.id);
                            }}
                          >
                            <Button
                              variant="link"
                              className="ml-auto text-right"
                              style={{
                                fontSize: "1.05rem",
                                color:
                                  copiedId == item.id
                                    ? "rgb(62, 207, 142)"
                                    : props.isLightMode
                                    ? "#6772ef"
                                    : undefined,
                              }}
                            >
                              <FontAwesomeIcon
                                icon={
                                  copiedId == item.id
                                    ? faClipboardCheck
                                    : faClipboard
                                }
                              />
                            </Button>
                          </CopyToClipboard>
                        )}
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
      <div className="mt-auto" style={{ borderBottomLeftRadius: 15 }}>
        <SendMessage
          settings={props.settings}
          user={props.user}
          isLibrary={true}
          createItem={props.createItem}
          libraryItemCreating={props.libraryItemCreating}
        />
      </div>
    </div>
  );
}
