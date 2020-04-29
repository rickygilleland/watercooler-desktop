import React from 'react';
import { Row, Col, Button, Navbar, Dropdown, Modal, Card, Image } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

function ManageUsersModal(props) {
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
            Manage Team
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {loading == "true" ?
            <>
                <h1 className="text-center h5">Loading Team...</h1>
                <center><FontAwesomeIcon icon={faCircleNotch} className="mt-3" style={{fontSize:"2.4rem",color:"#6772ef"}} spin /></center> 
            </>
        : 
          <>
            {users.map((user) =>
                <div key={user.id}>
                  <Row className="align-items-center justify-content-center">
                    <Col xs={2} className="pr-0">
                      <Image src={user.avatar_url} fluid roundedCircle style={{maxHeight:40}} />
                    </Col>
                    <Col xs={4} className="pl-0">
                      <p className="text-left" style={{fontWeight:600}}>{user.name}</p>
                    </Col>
                    <Col xs={{span:4,offset:2}}>
                      <Button size="sm">Manage User</Button>
                    </Col>
                  </Row>
                </div>
            )}
          </>
        
        }
         
        </Modal.Body>
      </Modal>
    );
}

export default ManageUsersModal;