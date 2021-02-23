import { Alert, Button, Card, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsFromRedux } from "../containers/LoginPage";
import { RouteComponentProps } from "react-router";
import { Routes } from "./RootComponent";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import React from "react";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer } = require("electron");

interface State {
  username: string;
  password: string;
  missingUsername: boolean;
  missingPassword: boolean;
  loginError: boolean;
  codeError: boolean;
  loginCodeRequested: boolean;
  loading: boolean;
}

interface LoginProps extends PropsFromRedux, RouteComponentProps {}

export default class Login extends React.Component<LoginProps, State> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      username: "",
      password: "",
      missingUsername: false,
      missingPassword: false,
      loginError: false,
      codeError: false,
      loginCodeRequested: false,
      loading: false,
    };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.requestNewCode = this.requestNewCode.bind(this);
  }

  componentDidMount(): void {
    const { auth, push } = this.props;

    if (auth.isLoggedIn === true) {
      push(Routes.Loading);
    }

    ipcRenderer.on("url_update", (event, arg) => {
      const pushUrl = arg.slice(13);

      if (pushUrl.includes("magic")) {
        push(arg.slice(13));
      }
    });
  }

  componentDidUpdate(prevProps: PropsFromRedux): void {
    const { auth, push } = this.props;

    if (auth.isLoggedIn === true) {
      push(Routes.Loading);
    }

    if (prevProps.auth !== auth) {
      if (
        prevProps.auth.loading == true &&
        auth.loading == false &&
        auth.loginError == false &&
        auth.codeError == false
      ) {
        this.setState({
          loading: false,
          loginError: auth.loginError,
          loginCodeRequested: true,
        });
      }
      this.setState({
        loading: false,
        loginError: auth.loginError,
        codeError: auth.codeError,
      });
    }
  }

  componentWillUnmount(): void {
    ipcRenderer.removeAllListeners("url_update");
  }

  handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ username: event.target.value });
  }

  handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ password: event.target.value });
  }

  handleSubmit(event: React.MouseEvent): void {
    event.preventDefault();
    const { requestLoginCode, authenticateUser } = this.props;
    const { loginCodeRequested, username, password } = this.state;

    if (username == "") {
      return this.setState({ missingUsername: true, missingPassword: false });
    }

    if (loginCodeRequested == true) {
      if (password == "") {
        return this.setState({ missingUsername: false, missingPassword: true });
      }

      this.setState({ missingUsername: false, missingPassword: false });

      authenticateUser(username, password.trim());
      return;
    }

    requestLoginCode(username);
  }

  requestNewCode(): void {
    const { requestLoginCode } = this.props;
    const { username } = this.state;

    if (username == "") {
      return this.setState({ missingUsername: true, missingPassword: false });
    }

    requestLoginCode(username);
  }

  render(): JSX.Element {
    const { auth } = this.props;
    const {
      loginCodeRequested,
      loginError,
      codeError,
      missingUsername,
      missingPassword,
      username,
      password,
    } = this.state;

    return (
      <React.Fragment>
        <div>
          <Card className="mt-5 shadow-sm mx-auto" body>
            <h1 className="h2 text-center mt-3 mb-3 font-weight-bolder">
              Sign in to Blab
            </h1>

            {loginError && (
              <Alert variant="danger" className="text-center">
                Oops! The login code you entered was incorrect, has already been
                used, or is expired.
              </Alert>
            )}

            {codeError && (
              <Alert variant="danger" className="text-center">
                Oops! We couldn't find an account under that email address.
              </Alert>
            )}

            {loginCodeRequested && !codeError && !loginError && (
              <Alert variant="success" className="text-center">
                We sent a temporary login code to {username}. Enter the
                temporary code below to sign in.
              </Alert>
            )}

            {missingUsername && (
              <Alert variant="danger" className="text-center">
                Oops! You forgot to enter your email address.
              </Alert>
            )}

            {missingPassword && (
              <Alert variant="danger" className="text-center">
                Oops! You forgot to enter your password.
              </Alert>
            )}

            <Form>
              <Form.Group controlId="formBasicEmail">
                <Form.Control
                  type={loginCodeRequested ? "hidden" : "text"}
                  placeholder="eleanor@yourworkemail.com"
                  value={username}
                  onChange={this.handleUsernameChange}
                  size="lg"
                />
              </Form.Group>

              {loginCodeRequested && (
                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Login Code</Form.Label>
                  <Form.Control
                    name="password"
                    type="text"
                    placeholder="Code"
                    value={password}
                    onChange={this.handlePasswordChange}
                    size="lg"
                    className="ph-no-capture"
                  />
                </Form.Group>
              )}

              <Button
                variant="primary"
                className="btn-block btn-lg mt-4"
                type="submit"
                disabled={auth.loading}
                onClick={this.handleSubmit}
              >
                {auth.loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
                {loginCodeRequested ? "Log In" : "Continue"}
              </Button>
            </Form>
            {loginCodeRequested && (
              <>
                <hr />
                <Button
                  variant="secondary"
                  className="btn-block btn-lg mt-4"
                  type="submit"
                  onClick={this.requestNewCode}
                >
                  Request a New Code
                </Button>
              </>
            )}
          </Card>
        </div>
      </React.Fragment>
    );
  }
}
