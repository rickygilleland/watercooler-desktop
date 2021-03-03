import { Billing } from "../store/types/organization";
import {
  Col,
  Form,
  FormControl,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleNotch,
  faLock,
  faLockOpen,
  faMicrophoneAlt,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

interface CreateRoomFormProps {
  loading: boolean;
  billing: Billing;
  createRoomSuccess: boolean;
  lastCreatedRoomSlug: string | null;
  handleSubmit(name: string, audioOnly: boolean, isPrivate: boolean): void;
  push(location: string): void;
  onHide(): void;
}

export default function CreateRoomForm(
  props: CreateRoomFormProps,
): JSX.Element {
  const { createRoomSuccess, onHide } = props;
  const [name, setName] = useState("");
  const [audioOnly, setAudioOnly] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleVideoEnabledChange = () => {
    setAudioOnly(audioOnly ? false : true);
  };

  const handleIsPrivateChanged = () => {
    setIsPrivate(isPrivate ? false : true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    props.handleSubmit(name, !audioOnly, isPrivate);
    setSubmitted(true);
  };

  useEffect(() => {
    if (createRoomSuccess && submitted) {
      onHide();
    }
  }, [createRoomSuccess, submitted, onHide]);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <FontAwesomeIcon icon={faArrowLeft} onClick={() => props.onHide()} />
          <Title>Create a Room</Title>
        </HeaderContent>
      </Header>

      <FormContainer onSubmit={handleSubmit}>
        <Form.Label>Name</Form.Label>
        <StyledInput
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="e.g. Daily Standup"
          className="mb-4"
        />
        <Row>
          <Col xs="9">
            <Form.Label>
              Voice Only <Icon icon={audioOnly ? faMicrophoneAlt : faVideo} />
            </Form.Label>
            <p className="text-muted" style={{ fontSize: ".8rem" }}>
              Video will always be off in voice only rooms.
            </p>
          </Col>
          <Col className="text-right">
            {!props.billing.video_enabled ? (
              <OverlayTrigger
                overlay={
                  <Tooltip id="tooltip-view-members">
                    Video rooms are not enabled for your organization.
                  </Tooltip>
                }
              >
                <span className="d-inline-block">
                  <Form.Check
                    type="switch"
                    id="video_enabled_switch"
                    name="video_enabled"
                    checked={audioOnly}
                    label=""
                    size={100}
                    onChange={handleVideoEnabledChange}
                    style={{ marginTop: "1.9rem", pointerEvents: "none" }}
                    disabled
                  />
                </span>
              </OverlayTrigger>
            ) : (
              <Form.Check
                type="switch"
                id="video_enabled_switch"
                name="video_enabled"
                checked={audioOnly}
                label=""
                size={100}
                onChange={handleVideoEnabledChange}
                style={{ marginTop: "1.9rem", pointerEvents: "none" }}
              />
            )}
          </Col>
        </Row>
        <Row>
          <Col xs="9">
            <Form.Label>
              Private <Icon icon={isPrivate ? faLock : faLockOpen} />
            </Form.Label>
            <p className="text-muted" style={{ fontSize: ".8rem" }}>
              Private rooms can only be viewed or joined by invitation.
            </p>
          </Col>
          <Col className="text-right">
            <Form.Check
              type="switch"
              id="is_private_switch"
              name="is_private"
              checked={isPrivate}
              label=""
              size={100}
              onChange={handleIsPrivateChanged}
              style={{ marginTop: "1.9rem" }}
            />
          </Col>
        </Row>
      </FormContainer>
      {props.loading && (
        <SubmitButton>
          {" "}
          <FontAwesomeIcon icon={faCircleNotch} spin /> Creating Room
        </SubmitButton>
      )}
      {!props.loading && (
        <SubmitButton onClick={handleSubmit}>Create Room</SubmitButton>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  color: #fff;
`;

const Header = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  border-bottom: 1.5px solid rgb(255, 255, 255, 0.3);
  user-select: none;
  margin-top: 10px;
`;

const HeaderContent = styled.div`
  margin-left: 12px;
  display: flex;
  align-items: center;

  svg {
    cursor: pointer;
    color: #f9426c;
  }
`;

const Title = styled.div`
  font-size: 16px;
  margin-left: 12px;
  font-weight: 600;
`;

const FormContainer = styled(Form)`
  display: flex;
  flex-wrap: wrap;
  height: calc(100vh - 90px);
  overflow: auto;
  padding: 12px;
  flex-direction: column;
`;

const SubmitButton = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 100%;
  justify-content: center;
  background-color: rgb(40, 199, 93, 0.95);
  transition: background-color 0.3s ease;
  font-weight: 600;
  position: fixed;
  bottom: 0;

  &:hover {
    background-color: rgb(40, 199, 93, 0.65);
  }
`;

const Icon = styled(FontAwesomeIcon)`
  opacity: 0.6;
  font-size: 13px;
  margin-left: 4px;
`;

const StyledInput = styled(FormControl)`
  background-color: transparent;
  border: none;
  border-bottom: 1px solid #fff;
  border-radius: 0;
  color: #fff;

  &:focus,
  &:active {
    background-color: transparent;
    outline: none !important;
    color: #fff;
  }
`;
