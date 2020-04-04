import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Form, Card, Alert, Navbar } from 'react-bootstrap';
import routes from '../constants/routes.json';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

const { ipcRenderer } = require('electron')

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            loading: false,
            missingError: false,
            loginError: false,
        };

    }

    componentDidMount() {
        const { auth, user, push, getUserDetails } = this.props;

        if (auth.isLoggedIn === true) {
            if (Object.keys(user).length === 0 || typeof user == 'undefined') {
                return getUserDetails();
            }
            push(auth.redirectUrl);
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

        if (prevProps.auth !== auth) {
            this.setState({ loading: false, loginError: auth.loginError });
        }

    }

    render() {
        const { loading, loginError, missingError } = this.state;
        const { auth, authenticateUserStart } = this.props;

        return (
            <React.Fragment>
                <Navbar className="bg-white mb-4 pt-3" expand="lg"></Navbar>
                <Container data-tid="container" fluid>
                    <Card className="mt-5 shadow-sm border-0" body>
                        <p className="sub-heading text-muted text-center mt-3">Sign in to Water Cooler</p>

                        <center><a onClick={ () => authenticateUserStart() } href="https://slack.com/oauth/authorize?scope=identity.basic,identity.email,identity.team,identity.avatar&client_id=1000366406420.1003032710326&redirect_uri=https://watercooler.work/api/login/slack"><img alt="Sign in with Slack" height="40" width="172" src="https://platform.slack-edge.com/img/sign_in_with_slack.png" srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" /></a></center>

                    </Card>
                </Container>
            </React.Fragment>
        );
    }
}

export default Login;

