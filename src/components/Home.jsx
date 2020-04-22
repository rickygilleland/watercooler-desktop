import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Card, Navbar, Table } from 'react-bootstrap';
import routes from '../constants/routes.json';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faSignOutAlt, faDoorOpen } from '@fortawesome/free-solid-svg-icons';

class Home extends React.Component {

    componentDidMount() {
        const { getRooms, auth } = this.props;
        getRooms();
    }

    componentDidUpdate() {
        const { organization, teams } = this.props;
    }

    render() {
        const { organization, teams, userLogout } = this.props;
        
        return(
            <React.Fragment>
                <Container data-tid="container" fluid>
                    <Card className="mb-3 shadow-sm border-0" body>
                        <h1>Select a Room to get Started</h1>
                    </Card>
             
                </Container>
            </React.Fragment>
        )
    }

}

export default Home;

