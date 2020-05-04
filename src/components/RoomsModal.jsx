import React, { useState } from 'react';
import { Row, Col, Button, Navbar, Dropdown, Modal, Card, Image, Form, Alert } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faWindowClose } from '@fortawesome/free-solid-svg-icons';


function RoomsModal(props) {
    const [ name, setName ] = useState("");
    const [ videoEnabled, setVideoEnabled ] = useState(false);
    const [ isPrivate, setIsPrivate ] = useState(false);
    const [ formSubmitted, setFormSubmitted ] = useState(false);

    function handleNameChange(event) {
        setName(event.target.value);
    }

    function handleVideoEnabledChange(event) {
      setVideoEnabled(videoEnabled ? false : true);
    }

    function handleIsPrivateChanged(event) {
      setIsPrivate(isPrivate ? false : true);
    }
    
    function handleSubmit(event) {
        event.preventDefault();
        setFormSubmitted(true);
        props.handleSubmit(name, videoEnabled, isPrivate);
    }

    function handleHide() {
      setFormSubmitted(false);
      setName("");
      setVideoEnabled(false);
      setIsPrivate(false);
      props.onHide();
    }

    return (
      <Modal
        show={props.show}
        onHide={handleHide}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title className="font-weight-bolder">
            Create a Room
          </Modal.Title>
          <Button variant="outline-secondary" style={{borderColor:"transparent"}} onClick={() => handleHide()}><FontAwesomeIcon icon={faWindowClose}></FontAwesomeIcon></Button>
        </Modal.Header>
        <Modal.Body>

        {props.createroomsuccess && formSubmitted ? 
          <Alert variant="success" className="text-center">
            {name} was created successfully!
          </Alert>
        : ''}

          <Form onSubmit={handleSubmit}>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" value={name} onChange={handleNameChange} placeholder="e.g. Daily Standup" className="mb-4" />
              <Row>
                <Col xs="10">
                  <Form.Label>Enable Video</Form.Label>
                  <p className="text-muted" style={{fontSize:".8rem"}}>We recommend setting the channel to audio only unless you'll be using it for face to face meetings.</p>
                </Col>
                <Col className="text-right">
                  <Form.Check 
                    type="switch"
                    id="video_enabled_switch"
                    name="video_enabled"
                    checked={videoEnabled}
                    label=""
                    size="lg"
                    onChange={handleVideoEnabledChange}
                    style={{marginTop:"1.9rem"}}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs="10">
                  <Form.Label>Make Private</Form.Label>
                  <p className="text-muted" style={{fontSize:".8rem"}}>Private channels can only be viewed or joined by invitation.</p>
                </Col>
                <Col className="text-right">
                  <Form.Check 
                    type="switch"
                    id="is_private_switch"
                    name="is_private"
                    checked={isPrivate}
                    label=""
                    size="lg"
                    onChange={handleIsPrivateChanged}
                    style={{marginTop:"1.9rem"}}
                  />
                </Col>
              </Row>
              {props.loading == "true" ?
                <Button className="mt-3" variant="primary" type="submit" disabled><FontAwesomeIcon icon={faCircleNotch} spin /> Creating Room</Button>
              :
                <Button className="mt-3" variant="primary" type="submit">Create Room</Button>
              }
          </Form>
         
        </Modal.Body>
      </Modal>
    );
}

export default RoomsModal;