import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Form, Card, Alert, Navbar } from 'react-bootstrap';
import routes from '../constants/routes.json';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { getRooms } from '../actions/room';


class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            missingError: false,
            loginError: false,
        };

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    componentDidMount() {
        const { auth, user, organization, push, getUserDetails } = this.props;

        if (auth.isLoggedIn === true) {
            push("/loading");
        }

    }

    componentDidUpdate(prevProps, prevState) {
        const { auth, user, organization, push } = this.props;

        if (auth.isLoggedIn === true) {
            push("/loading");
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

        authenticateUser(this.state.username, this.state.password);
    };

    render() {
        const { auth } = this.props;
        const { loginError, missingError, username, password } = this.state;

        return (
            <React.Fragment>
                <Navbar className="bg-white mb-4" expand="lg"></Navbar>
                <Container data-tid="container" fluid>
                    <Card className="mt-5 shadow-sm border-0" body>
                        <p className="sub-heading text-muted text-center mt-3">Sign in to Water Cooler</p>

                        <Form>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    placeholder="Enter email" 
                                    value={username}
                                    onChange={this.handleUsernameChange}
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
                                />
                            </Form.Group>
                            {auth.loading ?
                                <Button variant="primary" className="btn-block" type="submit" disabled>
                                    <FontAwesomeIcon icon={faCircleNotch} spin /> Submit
                                </Button>
                            :
                                <Button variant="primary" className="btn-block" type="submit" onClick={this.handleSubmit}>
                                    Submit
                                </Button>
                            }
                        </Form>

                    </Card>
                </Container>
            </React.Fragment>
        );
    }
}

export default Login;

