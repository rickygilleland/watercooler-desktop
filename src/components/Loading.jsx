import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Card, Navbar, Table } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faSignOutAlt, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { push } from 'connected-react-router';

class Loading extends React.Component {

    componentDidMount() {
        const { getRooms, getUserDetails, user, auth, organization } = this.props;
        console.log("loading");

        if (Object.keys(user).length === 0 || typeof user == 'undefined') {
            getUserDetails();
        }

        if (organization == null) {
            getRooms();
        }
    
    }

    componentDidUpdate() {
        const { organization, user, teams, getUserDetails, getRooms } = this.props;

        if (Object.keys(user).length === 0 || typeof user == 'undefined') {
            getUserDetails();
        }

        if (organization == null) {
            getRooms();
        }
    }

    render() {
        return(
            <Container data-tid="container" fluid>
                <h1 className="text-center mt-5">Loading Water Cooler...</h1>
                <center><FontAwesomeIcon icon={faCircleNotch} className="mt-3" style={{fontSize:"2.4rem",color:"#6772ef"}} spin /></center>
            </Container>
        )
    }

}

export default Loading;
