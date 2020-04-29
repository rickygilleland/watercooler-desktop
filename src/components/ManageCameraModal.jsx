import React, { useState } from 'react';
import { Row, Col, Button, Navbar, Dropdown, Modal, Card, Image, Form } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

function ManageCameraModal(props) {
    const { loading, users, settings } = props;

    const [ defaultVideoInput, setDefaultVideoInput ] = useState(typeof settings.devices.videoInputs != "undefined" ? settings.devices.videoInputs[0].deviceId : "");
    const [ defaultAudioInput, setDefaultAudioInput ] = useState(typeof settings.devices.audioInputs != "undefined" ? settings.devices.audioInputs[0].deviceId : "");
    const [ defaultAudioOutput, setDefaultAudioOutput ] = useState(typeof settings.devices.audioOutputs != "undefined" ? settings.devices.audioOutputs[0].deviceId : "");

    function handleVideoInputChange(event) {
        setDefaultVideoInput(event.target.value);
    }

    function handleAudioInputChange(event) {
        setDefaultAudioInput(event.target.value);
    }
    
    function handleSubmit(event) {
        event.preventDefault();
        
        props.handleSubmit(defaultVideoInput, defaultAudioInput, defaultAudioOutput);
        props.onHide();
    }

    console.log(props);

    return (
      <Modal
        show={props.show}
        onShow={props.onShow}
        onHide={props.onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="font-weight-bolder">
            Camera Settings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>

            {typeof settings.devices.videoInputs != "undefined" ?

                <Form onSubmit={handleSubmit}>
                    <Form.Label>Set your Video Input:</Form.Label>
                    <Form.Control as="select" value={defaultVideoInput} onChange={handleVideoInputChange}>
                        {settings.devices.videoInputs.map(input =>
                            <option value={input.deviceId} key={input.deviceId}>{input.label}</option>    
                        )}
                    </Form.Control>
                    <Form.Label className="pt-3">Set your Audio Input:</Form.Label>
                    <Form.Control as="select" value={defaultAudioInput} onChange={handleAudioInputChange}>
                        {settings.devices.audioInputs.map(input =>
                            <option value={input.deviceId} key={input.deviceId}>{input.label}</option>    
                        )}
                    </Form.Control>
                
                    <p className="mt-4"><strong><i>Note:</i> If you're already connected to a room, you will need to leave the room and re-join for these settings to take effect.</strong></p>

                    <Button className="mt-1" variant="primary" type="submit">Update Camera Settings</Button>
                </Form>

            : '' }
         
        </Modal.Body>
      </Modal>
    );
}

export default ManageCameraModal;