import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Form, Card, Alert, Navbar } from 'react-bootstrap';
import routes from '../constants/routes.json';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

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
    
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

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

    handleUsernameChange(event) {
        this.setState({ username: event.target.value });
    };
    
    handlePasswordChange(event) {
        this.setState({ password: event.target.value });
    };

    handleSubmit(event) {
        event.preventDefault();
        const { authenticateUser } = this.props;
        const { username, password } = this.state;

        if (username == '' || password == '') {
            this.setState({ loading: false, loginError: false, missingError: true });
            return false;
        }

        this.setState({ loading: true, loginError: false, missingError: false });

        authenticateUser(username, password);
    };

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
        const { auth } = this.props;

        return (
            <React.Fragment>
                <Navbar className="bg-white mb-4 pt-3" expand="lg"></Navbar>
                <Container data-tid="container" fluid>
                    <Card className="mt-5 shadow-sm border-0" body>
                        <p className="sub-heading text-muted text-center mt-3">Sign in to Water Cooler</p>

                        {/*<a href="https://slack.com/oauth/authorize?scope=identity.basic,identity.email,identity.team,identity.avatar&client_id=1000366406420.1003032710326&redirect_uri=https://watercooler.work/login/slack/callback"><img alt="Sign in with Slack" height="40" width="172" src="https://platform.slack-edge.com/img/sign_in_with_slack.png" srcset="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" /></a>*/}

                        {missingError ? <Alert variant='danger' className="text-center">Oops! Did you miss a field?</Alert> : ''}
                        {loginError ? <Alert variant='danger' className="text-center">Oops! Looks like your email address or password was incorrect. Please double check them and try again.</Alert> : ''}

                        <Form>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    placeholder="Enter email" 
                                    value={this.state.username}
                                    onChange={this.handleUsernameChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control 
                                    name="password"
                                    type="password" 
                                    placeholder="Password" 
                                    value={this.state.password}
                                    onChange={this.handlePasswordChange}
                                    required
                                />
                            </Form.Group>
                            <Button variant="primary" className="btn-block" type="submit" onClick={this.handleSubmit}>
                                Submit {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : '' }
                            </Button>
                        </Form>
                    </Card>
                </Container>
            </React.Fragment>
        );
    }
}

export default Login;

