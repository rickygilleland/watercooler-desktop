import React from "react";
import { DateTime } from "luxon";
import { Container, Button, Card, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faClipboard,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
import SendMessage from "./SendMessage";
import MessageMediaPlayer from "./MessageMediaPlayer";

class Library extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      copiedId: null,
    };

    this.scrollToTop = this.scrollToTop.bind(this);
  }

  componentDidMount() {
    const { getLibraryItems } = this.props;

    getLibraryItems();
  }

  componentDidUpdate(prevProps) {
    const { libraryItemCreating } = this.props;

    if (!prevProps.libraryItemCreating && libraryItemCreating) {
      this.scrollToTop();
    }
  }

  scrollToTop() {
    if (
      typeof this.itemsContainer != "undefined" &&
      this.itemsContainer != null
    ) {
      setTimeout(() => {
        if (
          typeof this.itemsContainer != "undefined" &&
          this.itemsContainer != null
        ) {
          this.itemsContainer.scrollTop = 0;
        }
      }, 50);
    }
  }

  render() {
    const {
      libraryLoading,
      libraryItemCreating,
      createItem,
      settings,
      user,
      libraryItems,
      libraryItemsOrder,
      isLightMode,
    } = this.props;
    const { copiedId } = this.state;

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
                  {libraryLoading && (
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
        <Container
          style={{ overflowY: "scroll" }}
          ref={(el) => {
            this.itemsContainer = el;
          }}
          fluid
        >
          {libraryLoading && libraryItemsOrder.length == 0 && (
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
          {!libraryLoading && libraryItemsOrder.length == 0 && (
            <div style={{ marginTop: "4rem" }}>
              <Row className="mt-3 mb-4">
                <Col xs={{ span: 12 }} className="text-center">
                  <h1>Your library is empty.</h1>
                  <p>
                    Record your first audio or video Blab now and we'll store
                    here for later.
                  </p>
                </Col>
              </Row>
            </div>
          )}
          {libraryItemCreating && (
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
          {libraryItemsOrder.length > 0 && (
            <Row>
              {libraryItemsOrder.map((itemId) => {
                const item = libraryItems[itemId];

                if (item == null || typeof item == "undefined") {
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
                        backgroundColor: !isLightMode
                          ? "rgba(27, 30, 47, 0.5)"
                          : undefined,
                        border: !isLightMode
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
                              The video will appear here automatically
                              shortly...
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
                                "" + (isLightMode ? " text-muted" : "")
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
                          {typeof item.public_url != "undefined" && (
                            <CopyToClipboard
                              text={item.public_url}
                              onCopy={() => {
                                this.setState({ copiedId: item.id });
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
                                      : isLightMode
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
            settings={settings}
            user={user}
            isLibrary={true}
            createItem={createItem}
            libraryItemCreating={libraryItemCreating}
          />
        </div>
      </div>
    );
  }
}

export default Library;
