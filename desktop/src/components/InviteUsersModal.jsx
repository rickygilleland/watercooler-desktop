import React, { useState } from 'react';
import { Row, Col, Button, Navbar, Dropdown, Modal, Card, Image, Form, Alert } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faWindowClose, faUserPlus } from '@fortawesome/free-solid-svg-icons';


function InviteUsersModal(props) {
    const [ emails, setEmails ] = useState("");
    const [ formSubmitted, setFormSubmitted ] = useState(false);

    function handleEmailChange(event) {
        setEmails(event.target.value);
    }
    
    function handleSubmit(event) {
        event.preventDefault();

        setFormSubmitted(true);
        
        props.handleSubmit(emails);
    }

    function handleHide() {
      setFormSubmitted(false);
      setEmails("");
      props.onHide();
    }

    return (
      <Modal
        show={props.show}
        onHide={handleHide}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        scrollable={true}
      >
        <Modal.Header>
          <Modal.Title className="font-weight-bolder">
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" /> Invite Someone New
          </Modal.Title>
          <Button variant="outline-secondary" style={{borderColor:"transparent"}} onClick={() => handleHide()}><FontAwesomeIcon icon={faWindowClose}></FontAwesomeIcon></Button>
        </Modal.Header>
        <Modal.Body>

          {props.inviteuserssuccess && formSubmitted ? 

            <Alert variant="success" className="text-center">
              Your invites were successfully sent. Let them know to check their email to get started with Blab!
            </Alert>

          : ''}

          <Form onSubmit={handleSubmit}>
              <Form.Label>Enter the email address of each person you want to invite.</Form.Label>
              <Form.Label className="mb-4" style={{fontWeight:500,fontSize:".9rem"}}>Feel free to enter multiple addresses, separated by commas.</Form.Label>
              <Form.Control as="textarea" rows={4} value={emails} onChange={handleEmailChange} />
              {props.loading == "true" ?
                <Button className="mt-3" variant="primary" type="submit" disabled><FontAwesomeIcon icon={faCircleNotch} spin /> Sending Invites</Button>
              :
                <Button className="mt-3" variant="primary" type="submit">Send Invite</Button>
              }
          </Form>
         
        </Modal.Body>
      </Modal>
    );
}

export default InviteUsersModal;