import { Button, Card, Col, Modal, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faWindowClose,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import styled from "styled-components";

interface ScreenSharingModalProps {
  show: boolean;
  loading: boolean;
  sources: Electron.DesktopCapturerSource[];
  handleSubmit(screenToShare: string): void;
  onHide(): void;
}

export default function ScreenSharingModal(
  props: ScreenSharingModalProps,
): JSX.Element {
  const { loading, sources } = props;

  const handleSubmit = (screenToShare: string) => {
    props.handleSubmit(screenToShare);
    props.onHide();
  };

  return (
    <Modal
      show={props.show}
      onShow={props.onShow}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      scrollable={true}
    >
      <Modal.Header>
        <Modal.Title className="font-weight-bolder">
          Select a Window to Share
        </Modal.Title>
        <Button
          variant="outline-secondary"
          style={{ borderColor: "transparent" }}
          onClick={() => props.onHide()}
        >
          <FontAwesomeIcon icon={faWindowClose}></FontAwesomeIcon>
        </Button>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <>
            <h1 className="text-center h4">Loading your open windows...</h1>
            <Center>
              <FontAwesomeIcon
                icon={faCircleNotch}
                className="mt-3"
                style={{ fontSize: "2.4rem", color: "#6772ef" }}
                spin
              />
            </Center>
          </>
        ) : (
          <Row>
            {sources.map((source) => (
              <Col key={source.id} xs={6} className="hover-focus">
                <Card
                  style={{ backgroundColor: "transparent" }}
                  text="dark"
                  className="border-0 mb-2"
                  onClick={() => handleSubmit(source.id)}
                >
                  {source.thumbnail && (
                    <Card.Img
                      src={source.thumbnail.toDataURL()}
                      style={{
                        maxHeight: 180,
                        width: "100%",
                        objectFit: "cover",
                        objectPosition: "0 0",
                      }}
                    />
                  )}

                  <Card.Body className="p-0">
                    <p className="font-weight-bold text-light pt-2">
                      <img
                        src={source.appIcon.toDataURL()}
                        style={{ height: 20 }}
                      />{" "}
                      {source.name}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Modal.Body>
    </Modal>
  );
}

const Center = styled.div`
  margin: 0 auto;
`;
