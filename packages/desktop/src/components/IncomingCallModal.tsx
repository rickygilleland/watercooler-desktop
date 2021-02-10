import React, { useState } from "react";
import {
  Row,
  Col,
  Button,
  Navbar,
  Dropdown,
  Modal,
  Card,
  CardDeck,
  Image,
  Form,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faTimes } from "@fortawesome/free-solid-svg-icons";

function IncomingCallModal(props) {
  function handleIncomingCall(acceptOrDecline) {
    props.handleIncomingCall(acceptOrDecline);
    props.onHide();
  }

  function handleSubmit() {
    props.handleSubmit();
    props.onHide();
  }

  return (
    <Modal
      show={props.show}
      onShow={props.onShow}
      onHide={props.onHide}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      scrollable={true}
    >
      <Modal.Body>
        <h1 className="text-center mb-4">Incoming Call</h1>

        <center>
          <Button
            variant="danger"
            className="mx-3"
            onClick={() => handleIncomingCall("decline")}
            size="lg"
          >
            <FontAwesomeIcon icon={faTimes} /> Decline
          </Button>
          <Button
            variant="success"
            className="mx-3"
            onClick={() => handleIncomingCall("accept")}
            size="lg"
          >
            <FontAwesomeIcon icon={faPhone} /> Answer
          </Button>
        </center>
      </Modal.Body>
    </Modal>
  );
}

export default IncomingCallModal;
