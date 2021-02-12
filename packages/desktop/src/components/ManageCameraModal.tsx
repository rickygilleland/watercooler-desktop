import { Button, Form, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SettingsState } from "../store/types/settings";
import { faCamera, faWindowClose } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";

interface ManageCameraModalProps {
  settings: SettingsState;
  handleSubmit(
    defaultVideoInput: string,
    defaultAudioInput: string,
    defaultAudioOutput: string,
    backgroundBlurAmount: number,
  ): void;
  onHide(): void;
  show: boolean;
  onShow(): void;
}

export default function ManageCameraModal(
  props: ManageCameraModalProps,
): JSX.Element {
  const { settings } = props;

  const [defaultVideoInput, setDefaultVideoInput] = useState(
    settings.defaultDevices != null &&
      typeof settings.defaultDevices.videoInput != "undefined"
      ? settings.defaultDevices.videoInput
      : typeof settings.devices.videoInputs != "undefined" &&
        typeof settings.devices.videoInputs[0] != "undefined"
      ? settings.devices.videoInputs[0].deviceId
      : "",
  );
  const [defaultAudioInput, setDefaultAudioInput] = useState(
    settings.defaultDevices != null &&
      typeof settings.defaultDevices.audioInput != "undefined"
      ? settings.defaultDevices.audioInput
      : typeof settings.devices.audioInputs != "undefined" &&
        typeof settings.devices.audioInputs[0] != "undefined"
      ? settings.devices.audioInputs[0].deviceId
      : "",
  );
  const [defaultAudioOutput] = useState(
    settings.defaultDevices != null &&
      typeof settings.defaultDevices.audioOutput != "undefined"
      ? settings.defaultDevices.audioOutput
      : typeof settings.devices.audioOutputs != "undefined" &&
        typeof settings.devices.audioOutputs[0] != "undefined"
      ? settings.devices.audioOutputs[0].deviceId
      : "",
  );
  const [backgroundBlurAmount, setBackgroundBlurAmount] = useState(
    settings.roomSettings.backgroundBlurAmount,
  );

  function handleVideoInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDefaultVideoInput(event.target.value);
  }

  function handleAudioInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDefaultAudioInput(event.target.value);
  }

  function handleBackgroundBlurAmountChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setBackgroundBlurAmount(parseInt(event.target.value));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    props.handleSubmit(
      defaultVideoInput,
      defaultAudioInput,
      defaultAudioOutput,
      backgroundBlurAmount,
    );
    props.onHide();
  }

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
          <FontAwesomeIcon icon={faCamera} className="mr-2" /> Camera Settings
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
        {typeof settings.devices.videoInputs != "undefined" ? (
          <Form onSubmit={handleSubmit}>
            <Form.Label>Set your Video Input:</Form.Label>
            <Form.Control
              as="select"
              value={defaultVideoInput}
              onChange={handleVideoInputChange}
            >
              {settings.devices.videoInputs.map((input) => (
                <option value={input.deviceId} key={input.deviceId}>
                  {input.label}
                </option>
              ))}
            </Form.Control>
            <Form.Label className="pt-3">Set your Audio Input:</Form.Label>
            <Form.Control
              as="select"
              value={defaultAudioInput}
              onChange={handleAudioInputChange}
            >
              {settings.devices.audioInputs.map((input) => (
                <option value={input.deviceId} key={input.deviceId}>
                  {input.label}
                </option>
              ))}
            </Form.Control>

            <p
              className="mt-3 mb-0 pb-0 text-muted"
              style={{ fontSize: ".8rem" }}
            >
              <i>Note:</i> If you're already connected to a room, you will need
              to re-join for your new video input or audio input settings to
              take effect.
            </p>

            <Form.Label className="pt-3">Background Blur Amount</Form.Label>
            <Form.Control
              type="range"
              className="mb-3"
              name="backgroundBlurAmount"
              value={backgroundBlurAmount}
              onChange={handleBackgroundBlurAmountChange}
            />

            <Button className="mt-3" variant="primary" type="submit">
              Update Camera Settings
            </Button>
          </Form>
        ) : (
          ""
        )}
      </Modal.Body>
    </Modal>
  );
}
