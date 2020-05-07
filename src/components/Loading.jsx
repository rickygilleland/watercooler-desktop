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
        const { getOrganizations, getUserDetails, push, user, auth, organization, organizationLoading, teams } = this.props;

        getOrganizations();

        if (Object.keys(user).length === 0 || typeof user == 'undefined') {
            return getUserDetails();
        }

        if (this.state.redirect === false) {
            this.setState({ redirect: true });

            if (teams[0].rooms.length > 0 && typeof teams[0].rooms[0].slug != "undefined") {
                var slug = teams[0].rooms[0].slug;
                return push(`/room/${slug}`);
            }

            return push(routes.TEAM);
        }
    
    }

    componentDidUpdate() {
        const { 
            organization, 
            organizationUsers, 
            user, 
            push, 
            teams, 
            getUserDetails, 
            getOrganizations, 
            getOrganizationUsers 
        } = this.props;

        if (Object.keys(user).length === 0 || typeof user == 'undefined') {
            return getUserDetails();
        }

        if (organization == null) {
            return getOrganizations();
        }

        if (organizationUsers.length == 0 && typeof organization.id != "undefined") {
            return getOrganizationUsers(organization.id);
        }

        if (this.state.redirect === false) {
            this.setState({ redirect: true });

            if (teams[0].rooms.length > 0 && typeof teams[0].rooms[0].slug != "undefined") {
                var slug = teams[0].rooms[0].slug;
                return push(`/room/${teams[0].rooms[0].slug}`);
            }

            return push(routes.TEAM);
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
