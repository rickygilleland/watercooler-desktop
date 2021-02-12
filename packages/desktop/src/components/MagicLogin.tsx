import { Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsFromRedux } from "../containers/MagicLoginPage";
import { RouteComponentProps } from "react-router";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect } from "react";
import routes from "../constants/routes.json";

interface MagicLoginProps extends PropsFromRedux, RouteComponentProps {}

export default function MagicLogin(props: MagicLoginProps): JSX.Element {
  useEffect(() => {
    if (props.auth.isLoggedIn) {
      props.push(routes.LOADING);
      return;
    }
  }, [props, props.auth.isLoggedIn]);

  useEffect(() => {
    if (props.auth.loginError) {
      props.push(routes.LOGIN);
    }
  }, [props, props.auth.loginError]);

  useEffect(() => {
    props.authenticateUserMagicLink(props.loginCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.loginCode]);

  return (
    <Container data-tid="container" fluid>
      <h1 className="text-center mt-5">Logging you in...</h1>

      <FontAwesomeIcon
        icon={faCircleNotch}
        className="mt-3"
        style={{ fontSize: "2.4rem", color: "#6772ef" }}
        spin
      />
    </Container>
  );
}
