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
          <Modal.Title className="font-weight-bolder">
            Manage Users
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>

         
        </Modal.Body>
      </Modal>
    );
}

export default UsersModal;