import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Navbar, Row } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import routes from '../constants/routes.json';

export default function Room() {
    return (
        <React.Fragment>
        <Navbar bg="dark" className="text-light" expand="lg">
            <Navbar.Brand>
                <img
                    src="https://watercooler.work/img/water_cooler.png"
                    height="40"
                    className="d-inline-block align-top"
                />
                customer-service / water-cooler
            </Navbar.Brand>
        </Navbar>
        <div className="fixed-bottom bg-dark py-2">
            <Row className="justify-content-md-center">
                <Button variant="light"><FontAwesomeIcon icon={faMicrophone} /></Button>
                <Button variant="light" className="mx-3"><FontAwesomeIcon icon={faVideo} /></Button>
                <Button variant="danger"><FontAwesomeIcon icon={faSignOutAlt} /></Button>
            </Row>
        </div>
        </React.Fragment>
    );
}
