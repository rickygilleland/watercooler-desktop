import React from 'react';
import { Row, Col, Button, Navbar, Dropdown, Modal } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

function UsersModal(props) {
    const { loading, users } = props;

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
        {loading == "true" ?
            <>
                <h1 className="text-center h5">Loading Users...</h1>
                <center><FontAwesomeIcon icon={faCircleNotch} className="mt-3" style={{fontSize:"2.4rem",color:"#6772ef"}} spin /></center> 
            </>
        : 
        
            <ul>
                {users.map((user) =>
                    <li key={user.id} style={{listStyleType:"none"}}>{user.name}</li>
                )}
            </ul>
        
        }
         
        </Modal.Body>
      </Modal>
    );
}

export default UsersModal;