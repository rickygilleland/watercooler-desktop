import React, { useState } from 'react';
import { Row, Col, Button, Navbar, Dropdown, Modal, Card, Image, Form } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { 
  faWindowClose, 
  faUserPlus, 
  faCamera, 
  faSignOutAlt, 
  faFlask, 
  faCog,
  faDoorOpen,
} from '@fortawesome/free-solid-svg-icons';

function SettingsModal(props) {
    
    const { organization, handleShowModal, handleLogOut } = props;
    
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
            <FontAwesomeIcon icon={faCog} className="mr-2" /> Blab Settings
          </Modal.Title>
          <Button variant="outline-secondary" style={{borderColor:"transparent"}} onClick={() => props.onHide()}><FontAwesomeIcon icon={faWindowClose}></FontAwesomeIcon></Button>
        </Modal.Header>
        <Modal.Body>

            <Button variant="primary" className="mb-3" size="md" block onClick={() => handleShowModal("inviteUsers")}>
                <FontAwesomeIcon icon={faUserPlus} /> Invite People {typeof organization.name != "undefined" ? `to ${organization.name}` : '' }
            </Button>
            <Button variant="primary" className="my-3" size="md" block onClick={() => handleShowModal("cameraSettings")}>
                <FontAwesomeIcon icon={faCamera} /> Camera Settings
            </Button>
            <Button variant="primary" className="my-3" size="md" block onClick={() => handleShowModal("roomSettings")}>
                <FontAwesomeIcon icon={faDoorOpen} /> Room Settings
            </Button>
            {process.env.REACT_APP_PLATFORM != "web" && (
              <center>
                <Button variant="danger" className="my-3" size="md" onClick={() => handleShowModal("experimentalSettings")}>
                    <FontAwesomeIcon icon={faFlask} /> Experimental Features
                </Button>
              </center>
            )}
            <center>
                <Button variant="danger" className="mt-3" onClick={() => handleLogOut()}>
                    <FontAwesomeIcon icon={faSignOutAlt}/> Sign Out
                </Button>
            </center>
         
        </Modal.Body>
      </Modal>
    );
}

export default SettingsModal;