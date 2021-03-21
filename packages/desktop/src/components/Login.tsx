import { Alert, Button, Card, Form, FormControl } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsFromRedux } from "../containers/LoginPage";
import { RouteComponentProps } from "react-router";
import { Routes } from "./RootComponent";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { ipcRenderer, shell } from "electron";
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

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount(): void {
    const { auth, push } = this.props;

    if (auth.isLoggedIn === true) {
      push(Routes.Loading);
    }

    ipcRenderer.on("url_update", (event, arg) => {
      const pushUrl = arg.slice(6);

      if (pushUrl.includes("magic")) {
        push(pushUrl);
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

  handleSubmit(event: React.MouseEvent): void {
    event.preventDefault();

    shell.openExternal("https://blab.to/magic/app");
  }

  render(): JSX.Element {
    return (
      <Container>
        <Title>Blab</Title>
        <SubTitle>
          Voice first communication for the next generation of work
        </SubTitle>

        <LoginButton className="btn-block btn-lg" onClick={this.handleSubmit}>
          Sign In to Blab
        </LoginButton>
        <Description>
          We'll open your web browser to sign in and bring you back here
          afterwards.
        </Description>
      </Container>
    );
  }
}

const Container = styled(Card)`
  background-color: transparent;
  padding: 24px;
  color: #fff;
  height: 100vh;
`;

const Title = styled.div`
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-top: 32px;
  margin-bottom: 8px;
`;

const SubTitle = styled.div`
  text-align: center;
  margin-bottom: 24px;
  font-size: 16px;
  font-weight: 600;
`;

const LoginButton = styled(Button)`
  background-color: rgb(40, 199, 93, 0.95) !important;
  border-color: transparent !important;

  &:hover {
    background-color: rgb(40, 199, 93, 0.65);
  }
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

const Description = styled.div`
  font-weight: 500;
  margin-top: 20px;
  color: rgb(255, 255, 255, 0.7);
`;
