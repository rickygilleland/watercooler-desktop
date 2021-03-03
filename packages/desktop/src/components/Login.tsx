import { Alert, Button, Card, Form, FormControl } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsFromRedux } from "../containers/LoginPage";
import { RouteComponentProps } from "react-router";
import { Routes } from "./RootComponent";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { ipcRenderer } from "electron";
import React from "react";
import styled from "styled-components";

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
    this.setState({ username: event.target.value, missingUsername: false });
  }

  handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ password: event.target.value, missingPassword: false });
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
      <Container>
        <Title>Blab</Title>

        <Form>
          <StyledInput
            type={loginCodeRequested ? "hidden" : "text"}
            placeholder="eleanor@yourworkemail.com"
            value={username}
            error={missingUsername}
            onChange={this.handleUsernameChange}
            size="lg"
          />

          {loginCodeRequested && (
            <React.Fragment>
              <Form.Label>Login Code</Form.Label>
              <StyledInput
                name="password"
                type="text"
                placeholder="Code"
                value={password}
                onChange={this.handlePasswordChange}
                size="lg"
                className="ph-no-capture"
                error={missingPassword}
              />
            </React.Fragment>
          )}

          <ErrorContainer>
            {missingUsername && <Error>Enter your email</Error>}
            {missingPassword && (
              <Error>Enter the login code we emailed to you</Error>
            )}
            {(loginError || codeError) && loginCodeRequested && (
              <Error>
                The login code you entered was incorrect, already used, or is
                expired
              </Error>
            )}
            {(loginError || codeError) && !loginCodeRequested && (
              <Error>We couldn't log you in with that email</Error>
            )}
            {loginCodeRequested &&
              !codeError &&
              !loginError &&
              !auth.loading && (
                <Success>
                  Enter the temporary code we sent to {username}
                </Success>
              )}
          </ErrorContainer>

          <Button
            variant="dark"
            className="btn-block btn-lg"
            type="submit"
            disabled={auth.loading}
            onClick={this.handleSubmit}
          >
            {auth.loading && (
              <FontAwesomeIcon
                icon={faCircleNotch}
                spin
                style={{ marginRight: 4 }}
              />
            )}
            {loginCodeRequested ? "Log In" : "Continue"}
          </Button>
        </Form>
        {loginCodeRequested && (
          <>
            <hr />
            <Button
              variant="outline-secondary"
              className="btn"
              style={{ width: "80%", margin: "0 auto" }}
              type="submit"
              onClick={this.requestNewCode}
            >
              Request a New Code
            </Button>
          </>
        )}
      </Container>
    );
  }
}

const Container = styled(Card)`
  background-color: transparent;
  padding: 24px;
  color: #fff;
`;

const Title = styled.div`
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 28px;
`;

export const StyledInput = styled(FormControl)<{
  error: boolean;
}>`
  background-color: transparent;
  border: 2px solid
    ${(props) => (props.error ? "#f9426c" : "rgb(255, 255, 255, 0.2)")};
  color: #fff;

  &:focus,
  &:active {
    background-color: transparent;
    color: #fff;
    box-shadow: none;
    border-color: rgb(255, 255, 255, 0.1);
  }
`;

const ErrorContainer = styled.div`
  min-height: 24px;
  margin: 10px 0;
`;

const Error = styled.div`
  color: #f9426c;
`;

const Success = styled.div`
  color: rgb(51, 255, 119, 0.95);
`;
