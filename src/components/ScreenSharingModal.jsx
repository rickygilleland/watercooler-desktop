import React, { useState } from 'react';
import { Row, Col, Button, Navbar, Dropdown, Modal, Card, CardDeck, Image, Form } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faWindowClose } from '@fortawesome/free-solid-svg-icons';

function ScreenSharingModal(props) {
    const { loading, sources } = props;

    function handleSubmit(screenToShare) {
        
        props.handleSubmit(screenToShare);
        props.onHide();
    }

    return (
      <Modal
        show={props.show}
        onShow={props.onShow}
        onHide={props.onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        scrollable={true}
      >
        <Modal.Header>
          <Modal.Title className="font-weight-bolder">
            Select a Window to Share
          </Modal.Title>
          <Button variant="outline-secondary" style={{borderColor:"transparent"}} onClick={() => props.onHide()}><FontAwesomeIcon icon={faWindowClose}></FontAwesomeIcon></Button>
        </Modal.Header>
        <Modal.Body>
            {loading ?
                <>
                    <h1 className="text-center h4">Loading your open windows...</h1>
                    <center><FontAwesomeIcon icon={faCircleNotch} className="mt-3" style={{fontSize:"2.4rem",color:"#6772ef"}} spin /></center> 
                </>
            :
                <Row>
                    {sources.map((source) => 
                        <Col key={source.id} xs={6} className="hover-focus">
                            <Card style={{backgroundColor:"transparent"}} text="dark" className="border-0 mb-2" onClick={() => handleSubmit(source.id)}>
                                {source.thumbnail != "data:image/png;base64," 
                                  ?
                                    <Card.Img src={source.thumbnail} style={{maxHeight:180,width:"100%",objectFit:"cover",objectPosition:"0 0"}} />
                                  :
                                    ''
                                }
                                <Card.Body className="p-0"><p className="font-weight-bold text-light pt-2"><img src={source.icon} style={{height:20}}/> {source.name}</p></Card.Body>
                            </Card>
                        </Col>
                    )}
                </Row>
            }  
        

        </Modal.Body>
      </Modal>
    );
}

export default ScreenSharingModal;