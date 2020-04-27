import React from 'react';
import { Row, Col, Button, Navbar, Dropdown, Modal } from 'react-bootstrap';

function UsersModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Manage Users
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>

         
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
}

export default UsersModal;