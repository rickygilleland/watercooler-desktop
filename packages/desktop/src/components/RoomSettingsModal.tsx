import { Button, Form, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SettingsState } from "../store/types/settings";
import { faDoorOpen, faWindowClose } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";

interface RoomSettingsModalProps {
  show: boolean;
  settings: SettingsState;
  updateRoomSettings(settingToUpdate: string, newValue: boolean): void;
  onHide(): void;
}

export default function RoomSettingsModal(
  props: RoomSettingsModalProps,
): JSX.Element {
  const { settings, updateRoomSettings } = props;

  const [audioEnabled, setAudioEnabled] = useState(
    settings.roomSettings.audioEnabled,
  );
  const [videoEnabled, setVideoEnabled] = useState(
    settings.roomSettings.videoEnabled,
  );
  const [backgroundBlurEnabled, setBackgroundBlurEnabled] = useState(
    settings.roomSettings.backgroundBlurEnabled,
  );

  function handleSettingsChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.name == "audio") {
      updateRoomSettings("audioEnabled", audioEnabled ? false : true);
      setAudioEnabled(audioEnabled ? false : true);
    }

    if (event.target.name == "video") {
      updateRoomSettings("videoEnabled", videoEnabled ? false : true);
      setVideoEnabled(videoEnabled ? false : true);
    }

    if (event.target.name == "backgroundBlur") {
      updateRoomSettings(
        "backgroundBlurEnabled",
        backgroundBlurEnabled ? false : true,
      );
      setBackgroundBlurEnabled(backgroundBlurEnabled ? false : true);
    }
  }

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      scrollable={true}
    >
      <Modal.Header>
        <Modal.Title className="font-weight-bolder">
          <FontAwesomeIcon icon={faDoorOpen} className="mr-2" /> Room Settings
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
        <p className="text-bold pt-0 mt-0">
          These settings will be used as the default when you join a room.
        </p>

        <Form>
          <Form.Check
            type="switch"
            id="audio_switch"
            name="audio"
            checked={audioEnabled}
            label="Microphone"
            onChange={handleSettingsChange}
            style={{ marginTop: "1.9rem" }}
          />

          <Form.Check
            type="switch"
            id="video_switch"
            name="video"
            checked={videoEnabled}
            label="Video"
            onChange={handleSettingsChange}
            style={{ marginTop: "1.9rem" }}
          />

          {/*<Form.Check
            type="switch"
            id="background_blur_switch"
            name="backgroundBlur"
            checked={backgroundBlurEnabled}
            label="Background Blur"
            onChange={handleSettingsChange}
            style={{ marginTop: "1.9rem" }}
          />
          <p className="text-muted pt-1">
            Background blur uses an on-device neural network to blur your
            background and surroundings.
          </p>
          <p className="text-muted small">
            Enabling this feature may cause performance issues on lower-end
            computers and is not guaranteed to hide private information.
          </p>*/}
        </Form>
      </Modal.Body>
    </Modal>
  );
}
