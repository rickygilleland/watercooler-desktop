import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Form, Card } from 'react-bootstrap';
import routes from '../constants/routes.json';

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    componentDidMount() {
       console.log(this.props);
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

    componentDidUpdate() {
        const { auth, push } = this.props;

        if (auth.isLoggedIn === true) {
            push(auth.redirectUrl);
        }
    }

    render() {
        return (
            <Container data-tid="container" fluid>
                <h1 className="text-center mt-5">Welcome to Water Cooler</h1>
            <Card body>
                <Form>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control 
                            type="email" 
                            placeholder="Enter email" 
                            value={this.state.username}
                            onChange={this.handleUsernameChange}
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
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" onClick={this.handleSubmit}>
                        Submit
                    </Button>
                </Form>
            </Card>
            </Container>
        );
    }
}

export default Login;

