import { Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faCog,
  faDoorOpen,
  faSignOutAlt,
  faWindowClose,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";

function SettingsModal(props) {
  const { handleShowModal, handleLogOut } = props;

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
          <FontAwesomeIcon icon={faCog} className="mr-2" /> Blab Settings
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
        <Button
          variant="primary"
          className="my-3"
          size="lg"
          block
          onClick={() => handleShowModal("cameraSettings")}
        >
          <FontAwesomeIcon icon={faCamera} /> Camera Settings
        </Button>
        <Button
          variant="primary"
          className="my-3"
          size="lg"
          block
          onClick={() => handleShowModal("roomSettings")}
        >
          <FontAwesomeIcon icon={faDoorOpen} /> Room Settings
        </Button>
        {/*process.env.REACT_APP_PLATFORM != "web" && (
              <center>
                <Button variant="danger" className="my-3" size="lg" onClick={() => handleShowModal("experimentalSettings")}>
                    <FontAwesomeIcon icon={faFlask} /> Experimental Features
                </Button>
              </center>
            )*/}
        <center>
          <Button
            variant="danger"
            className="mt-3"
            onClick={() => handleLogOut()}
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
          </Button>
        </center>
      </Modal.Body>
    </Modal>
  );
}

export default SettingsModal;
