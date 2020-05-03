import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Form, Card, Alert, Navbar } from 'react-bootstrap';
import routes from '../constants/routes.json';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { getOrganizations } from '../actions/organization';


class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            missingUsername: false,
            loginError: false,
            codeError: false,
            loginCodeRequested: false
        };

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.requestNewCode = this.requestNewCode.bind(this);

    }

    componentDidMount() {
        const { auth, user, organization, push, getUserDetails } = this.props;

        if (auth.isLoggedIn === true) {
            push(routes.LOADING);
        }

    }

    componentDidUpdate(prevProps, prevState) {
        const { auth, user, organization, push } = this.props;

        if (auth.isLoggedIn === true) {
            push(routes.LOADING);
        }

        if (prevProps.auth !== auth) {
            if (prevProps.auth.loading == true && auth.loading == false && auth.loginError == false && auth.codeError == false) {
                this.setState({ loading: false, loginError: auth.loginError, loginCodeRequested: true });
            }
            this.setState({ loading: false, loginError: auth.loginError, codeError: auth.codeError });
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
        const { requestLoginCode, authenticateUser, auth } = this.props;
        const { loginCodeRequested, username, password } = this.state;

        if (username == '') {
            return this.setState({ missingUsername: true, missingPassword: false });
        }

        if (loginCodeRequested == true) {
            if (password == '') {
                return this.setState({ missingUsername: false, missingPassword: true });
            }
    
            this.setState({ missingUsername: false, missingPassword: false });
    
            return authenticateUser(username, password);
        }

        requestLoginCode(username);
    };
    
    requestNewCode() {
        const { requestLoginCode } = this.props;
        const { username } = this.state;

        if (username == '') {
            return this.setState({ missingUsername: true, missingPassword: false });
        }

        requestLoginCode(username);
    }

    render() {
        const { auth } = this.props;
        const { loginCodeRequested, loginError, codeError, missingUsername, missingPassword, username, password } = this.state;

        return (
            <React.Fragment>
                <div className="w-100 vh-100">
                    <Card className="mt-5 shadow-sm mx-auto" style={{width:600}} body>
                        <h1 className="h2 text-center mt-3 mb-3 font-weight-bolder">Sign in to Water Cooler</h1>

                        {loginError ?
                            <Alert variant="danger" className="text-center">
                                Oops! The login code you entered was incorrect, has already been used, or is expired.
                            </Alert>
                            : ''
                        }

                        {codeError ?
                            <Alert variant="danger" className="text-center">
                                Oops! We couldn't find an account under that email address.
                            </Alert>
                            : ''
                        }

                        {loginCodeRequested && !codeError ?
                            <Alert variant="success" className="text-center">
                                We sent a tempoary login code to {username}. Enter the temporary code below to sign in.
                            </Alert>
                            : ''
                        }

                        {missingUsername ?
                            <Alert variant="danger" className="text-center">
                                Oops! You forgot to enter your email address.
                            </Alert>
                            : ''
                        }

                        {missingPassword ?
                            <Alert variant="danger" className="text-center">
                                Oops! You forgot to enter your password.
                            </Alert>
                            : ''
                        }

                        <Form>
                            <Form.Group controlId="formBasicEmail">
                                {loginCodeRequested ?
                                    <Form.Control 
                                        type="hidden" 
                                        placeholder="eleanor@yourworkemail.com" 
                                        value={username}
                                        onChange={this.handleUsernameChange}
                                        size="lg"
                                    />
                                :
                                    <>
                                        <Form.Label>Work Email address</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="eleanor@yourworkemail.com" 
                                            value={username}
                                            onChange={this.handleUsernameChange}
                                            size="lg"
                                        />
                                    </>
                                }
                            </Form.Group>

                            {loginCodeRequested ?
                                <Form.Group controlId="formBasicPassword">
                                    <Form.Label>Login Code</Form.Label>
                                    <Form.Control 
                                        name="password"
                                        type="text" 
                                        placeholder="Code" 
                                        value={password}
                                        onChange={this.handlePasswordChange}
                                        size="lg"
                                    />
                                </Form.Group>
                            : "" }

                            {auth.loading ?
                                <Button variant="primary" className="btn-block btn-lg mt-4" type="submit" disabled>
                                    <FontAwesomeIcon icon={faCircleNotch} spin /> {loginCodeRequested ? "Log In" : "Continue" }
                                </Button>
                            :
                                <Button variant="primary" className="btn-block btn-lg mt-4" type="submit" onClick={this.handleSubmit}>
                                    {loginCodeRequested ? "Log In" : "Continue" }
                                </Button>
                            }
                        </Form>


                        {loginCodeRequested ?
                            <>
                            <hr/>
                                <Button variant="secondary" className="btn-block btn-lg mt-4" type="submit" onClick={this.requestNewCode}>
                                    Request a New Code
                                </Button>
                            </>
                        : '' }

                    </Card>
                </div>
            </React.Fragment>
        );
    }
}

export default Login;

