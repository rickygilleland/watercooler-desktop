import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Form, Card, Alert, Navbar } from 'react-bootstrap';
import routes from '../constants/routes.json';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

class LoginCallback extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { auth, user, push, getUserDetails, authenticateUser, match } = this.props;

        if (auth.isLoggedIn === true) {
            
            if (Object.keys(user).length === 0 || typeof user == 'undefined') {
                return getUserDetails();
            }
            push(auth.redirectUrl);
        }

        if (auth.loginStarted === true) {
            authenticateUser(match.params.type, match.params.code);
        } else {
            push("/login");
        }

        if (auth.loginError === true) {
            push("/login");
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { auth, user, push, getUserDetails } = this.props;

        if (auth.isLoggedIn === true) {

            if (Object.keys(user).length === 0 || typeof user == 'undefined') {
                return getUserDetails();
            }
            push(auth.redirectUrl);
        }

        if (auth.loginError === true || auth.loginStarted === false) {
            push("/login");
        }
    }

    render() {

        return (
            <Container data-tid="container" fluid>
                <h1 className="text-center mt-5">Logging you in...</h1>
                <center><FontAwesomeIcon icon={faCircleNotch} className="mt-3" style={{fontSize:"2.4rem",color:"#6772ef"}} spin /></center>
            </Container>
        );
    }
}

export default LoginCallback;

