import React, { useState } from 'react';
import { Row, Col, Button, Navbar, Dropdown, Modal, Card, Image, Form } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faWindowClose } from '@fortawesome/free-solid-svg-icons';

function ManageCameraModal(props) {
    const { loading, users, settings } = props;

    const [ defaultVideoInput, setDefaultVideoInput ] = useState(settings.defaultDevices != null && typeof settings.defaultDevices.videoInput != "undefined" ? settings.defaultDevices.videoInput : typeof settings.devices.videoInputs != "undefined" && typeof settings.devices.videoInputs[0] != "undefined" ? settings.devices.videoInputs[0].deviceId : "");
    const [ defaultAudioInput, setDefaultAudioInput ] = useState(settings.defaultDevices != null && typeof settings.defaultDevices.audioInput != "undefined" ? settings.defaultDevices.audioInput : typeof settings.devices.audioInputs != "undefined" && typeof settings.devices.audioInputs[0] != "undefined" ? settings.devices.audioInputs[0].deviceId : "");
    const [ defaultAudioOutput, setDefaultAudioOutput ] = useState(settings.defaultDevices != null && typeof settings.defaultDevices.audioOutput != "undefined" ? settings.defaultDevices.audioOutput : typeof settings.devices.audioOutputs != "undefined" && typeof settings.devices.audioOutputs[0] != "undefined" ? settings.devices.audioOutputs[0].deviceId : "");

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
            Camera Settings
          </Modal.Title>
          <Button variant="outline-secondary" style={{borderColor:"transparent"}} onClick={() => props.onHide()}><FontAwesomeIcon icon={faWindowClose}></FontAwesomeIcon></Button>
        </Modal.Header>
        <Modal.Body>

            {typeof settings.devices.videoInputs != "undefined" ?

                <Form onSubmit={handleSubmit}>
                    <Form.Label>Set your Video Input:</Form.Label>
                    <Form.Control 
                        as="select" 
                        value={defaultVideoInput} 
                        onChange={handleVideoInputChange}
                    >
                        {settings.devices.videoInputs.map(input =>
                            <option value={input.deviceId} key={input.deviceId}>{input.label}</option>    
                        )}
                    </Form.Control>
                    <Form.Label className="pt-3">Set your Audio Input:</Form.Label>
                    <Form.Control 
                        as="select" 
                        value={defaultAudioInput} 
                        onChange={handleAudioInputChange}
                    >
                        {settings.devices.audioInputs.map(input =>
                            <option value={input.deviceId} key={input.deviceId}>{input.label}</option>    
                        )}
                    </Form.Control>
                
                    <p className="mt-4 text-muted" style={{fontSize:".8rem"}}><i>Note:</i> If you're already connected to a room, you will need to leave the room and re-join for these settings to take effect.</p>

                    <Button className="mt-1" variant="primary" type="submit">Update Camera Settings</Button>
                </Form>

            : '' }
         
        </Modal.Body>
      </Modal>
    );
}

export default ManageCameraModal;