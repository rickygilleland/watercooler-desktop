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
            password: '',
            missingUsername: false,
            missingPassword: false,
            loginError: false,
        };

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

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
            this.setState({ loading: false, loginError: auth.loginError });
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

        if (this.state.username == '') {
            return this.setState({ missingUsername: true, missingPassword: false });
        }

        if (this.state.password == '') {
            return this.setState({ missingUsername: false, missingPassword: true });
        }

        this.setState({ missingUsername: false, missingPassword: false });

        authenticateUser(this.state.username, this.state.password);
    };

    render() {
        const { auth } = this.props;
        const { loginError, missingUsername, missingPassword, username, password } = this.state;

        return (
            <React.Fragment>
                <div className="w-100 vh-100">
                    <Card className="mt-5 shadow-sm mx-auto" style={{width:600}} body>
                        <h1 className="h2 text-center mt-3 mb-3 font-weight-bolder">Sign in to Water Cooler</h1>

                        {loginError ?
                            <Alert variant="danger" className="text-center">
                                Oops! Your email address or password was incorrect. Please double check them and try again.
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
                                <Form.Label>Email address</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    placeholder="Enter email" 
                                    value={username}
                                    onChange={this.handleUsernameChange}
                                    size="lg"
                                    
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control 
                                    name="password"
                                    type="password" 
                                    placeholder="Password" 
                                    value={password}
                                    onChange={this.handlePasswordChange}
                                    size="lg"
                                />
                            </Form.Group>
                            {auth.loading ?
                                <Button variant="primary" className="btn-block btn-lg mt-4" type="submit" disabled>
                                    <FontAwesomeIcon icon={faCircleNotch} spin /> Submit
                                </Button>
                            :
                                <Button variant="primary" className="btn-block btn-lg mt-4" type="submit" onClick={this.handleSubmit}>
                                    Submit
                                </Button>
                            }
                        </Form>

                    </Card>
                </div>
            </React.Fragment>
        );
    }
}

export default Login;

