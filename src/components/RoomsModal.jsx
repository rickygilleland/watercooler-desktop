import React, { useState } from 'react';
import { Row, Col, Button, Navbar, Dropdown, Modal, Card, Image, Form, Alert } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faWindowClose } from '@fortawesome/free-solid-svg-icons';


function RoomsModal(props) {
    const [ name, setName ] = useState("");
    const [ audioOnly, setAudioOnly ] = useState(true);
    const [ formSubmitted, setFormSubmitted ] = useState(false);

    function handleNameChange(event) {
        setName(event.target.value);
    }

    function handleAudioOnlyChange(event) {
      setAudioOnly(event.target.value);
    }
    
    function handleSubmit(event) {
        event.preventDefault();

        setFormSubmitted(true);
        
        //props.handleSubmit(emails);
    }

    function handleHide() {
      setFormSubmitted(false);
      setName("");
      setAudioOnly(true);
      props.onHide();
    }

    return (
      <Modal
        show={props.show}
        onHide={handleHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title className="font-weight-bolder">
            Create a Room
          </Modal.Title>
          <Button variant="outline-secondary" onClick={() => handleHide()}><FontAwesomeIcon icon={faWindowClose}></FontAwesomeIcon></Button>
        </Modal.Header>
        <Modal.Body>

          <Form onSubmit={handleSubmit}>
              <Form.Label>What should we call this room?</Form.Label>
              <Form.Control type="text" value={name} onChange={handleNameChange} />
              <Form.Check 
                type="switch"
                name="audio_only"
                onChange={handleAudioOnlyChange}
                label="Audio Only?"
              />
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