import React, { useState } from 'react';
import { Row, Col, Button, Navbar, Dropdown, Modal, Card, Image, Form } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faWindowClose, faFlask } from '@fortawesome/free-solid-svg-icons';

function ExperimentalSettingsModal(props) {

    const { settings, updateExperimentalSettings } = props;

    const [ faceTrackingEnabled, setFaceTrackingEnabled ] = useState(settings.experimentalSettings.faceTracking);

    function handleSettingsChange(event) {
        if (event.target.name == "face_tracking") {
            updateExperimentalSettings("faceTracking", faceTrackingEnabled ? false : true);
            setFaceTrackingEnabled(faceTrackingEnabled ? false : true );  
        }      
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
        <Modal.Header>
          <Modal.Title className="font-weight-bolder">
            <FontAwesomeIcon icon={faFlask} className="mr-2" /> Experimental Features
          </Modal.Title>
          <Button variant="outline-secondary" style={{borderColor:"transparent"}} onClick={() => props.onHide()}><FontAwesomeIcon icon={faWindowClose}></FontAwesomeIcon></Button>
        </Modal.Header>
        <Modal.Body>

            <p className="text-bold pt-0 mt-0">Warning: Experimental features may be incomplete, unreliable, and cause unexpected behavior.</p> 

            <Form>
                <Form.Check 
                    type="switch"
                    id="face_tracking_switch"
                    name="face_tracking"
                    checked={faceTrackingEnabled}
                    label="Face Tracking"
                    size="lg"
                    onChange={handleSettingsChange}
                    style={{marginTop:"1.9rem"}}
                />
            </Form>
            <p className="text-muted pt-1">Face tracking uses an on-device neural network to crop your camera's view to only show your face and a small area around it.</p>
            <p className="text-muted small">Enabling this feature may cause your video to skip at times and has not been tested on lower-end computers.</p>

        </Modal.Body>
      </Modal>
    );
}

export default ExperimentalSettingsModal;