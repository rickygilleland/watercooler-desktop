import { Button, Image, Row } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { DateTime } from "luxon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Message as MessageType } from "../store/types/message";
import {
  faCircleNotch,
  faClipboard,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import MessageMediaPlayer from "./MessageMediaPlayer";
import React from "react";

interface MessageProps {
  message: MessageType;
  renderHeading: boolean;
  handleCopyToClipboard(messageId: number): void;
  lastCopiedMessageId: number;
}

interface State {
  formattedDate: string;
  copied: boolean;
}

export default class Message extends React.PureComponent<MessageProps, State> {
  constructor(props: MessageProps) {
    super(props);

    const date = DateTime.fromISO(this.props.message.created_at);

    this.state = {
      formattedDate: date.toLocaleString(DateTime.TIME_SIMPLE),
      copied: false,
    };
  }

  componentDidUpdate(prevProps: MessageProps): void {
    const { message, lastCopiedMessageId } = this.props;
    const { copied } = this.state;

    if (
      prevProps.lastCopiedMessageId != lastCopiedMessageId &&
      lastCopiedMessageId != message.id &&
      copied
    ) {
      this.setState({ copied: false });
    }
  }

  render(): JSX.Element {
    const { message, renderHeading, handleCopyToClipboard } = this.props;
    const { formattedDate, copied } = this.state;

    return (
      <>
        {renderHeading && (
          <Row style={{ marginLeft: 0 }}>
            <div style={{ width: 50 }}>
              <Image
                src={message.user?.avatar_url}
                fluid
                style={{ height: 50, borderRadius: 5 }}
              />
            </div>
            <p style={{ paddingLeft: 5, marginTop: 5 }}>
              <span style={{ fontSize: "1.0rem", fontWeight: 700 }}>
                {message.user?.first_name} {message.user?.last_name}
              </span>
              <span style={{ fontSize: ".7rem", paddingLeft: 5 }}>
                {formattedDate}
              </span>
            </p>
          </Row>
        )}
        <Row style={{ marginLeft: renderHeading ? 55 : 0 }} className="mb-1">
          {!renderHeading && (
            <p
              className="align-self-center mb-0 mr-2"
              style={{ fontSize: ".7rem", width: 50 }}
            >
              {formattedDate}
            </p>
          )}
          {message.attachments.length > 0 &&
            message.attachments[0].processed == true && (
              <div
                style={{
                  height:
                    message.attachments[0].mime_type == "video/mp4" ? 350 : 50,
                  width:
                    message.attachments[0].mime_type == "video/mp4" ? 466 : 466,
                }}
              >
                <MessageMediaPlayer
                  autoplay={false}
                  controls={true}
                  source={message.attachments[0].temporary_url}
                  mediaType={message.attachments[0].mime_type}
                  thumbnail={message.attachments[0].thumbnail_url}
                  muted={false}
                  id={`video_player_${message.id}`}
                />
              </div>
            )}
          {message.attachments.length > 0 &&
            message.attachments[0].processed == false && (
              <p style={{ paddingTop: 15, fontWeight: 700 }}>
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
        </Row>
        <Row className="mb-4">
          {message.is_public == true &&
            typeof message.public_url != "undefined" && (
              <CopyToClipboard
                text={message.public_url}
                onCopy={() => {
                  this.setState({ copied: true });
                  handleCopyToClipboard(message.id);
                }}
              >
                <Button
                  variant="link"
                  style={{
                    marginLeft: 60,
                    fontSize: ".8rem",
                    color: copied ? "rgb(62, 207, 142)" : "#6772ef",
                  }}
                >
                  <FontAwesomeIcon
                    icon={copied ? faClipboardCheck : faClipboard}
                  />{" "}
                  {copied
                    ? "Link Copied to Clipboard"
                    : "Copy Shareable Link to Clipboard"}
                </Button>
              </CopyToClipboard>
            )}
        </Row>
      </>
    );
  }
}
