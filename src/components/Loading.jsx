import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Card, Navbar, Table } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faSignOutAlt, faDoorOpen } from '@fortawesome/free-solid-svg-icons';

class Loading extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
        };
    }

    componentDidMount() {
        const { getRooms, getUserDetails, push, user, auth, organization } = this.props;

        if (Object.keys(user).length === 0 || typeof user == 'undefined') {
            return getUserDetails();
        }

        if (organization == null) {
            return getRooms();
        }

        if (this.state.redirect === false) {
            this.setState({ redirect: true });
            push(routes.REDIRECT)
        }
    
    }

    componentDidUpdate() {
        const { organization, user, push, teams, getUserDetails, getRooms } = this.props;

        if (Object.keys(user).length === 0 || typeof user == 'undefined') {
            return getUserDetails();
        }

        if (organization == null) {
            return getRooms();
        }

        if (this.state.redirect === false) {
            this.setState({ redirect: true });
            push(routes.REDIRECT)
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
