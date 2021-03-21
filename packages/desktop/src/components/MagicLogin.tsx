import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsFromRedux } from "../containers/MagicLoginPage";
import { RouteComponentProps } from "react-router";
import { Routes } from "./RootComponent";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect } from "react";
import styled from "styled-components";

interface MagicLoginProps extends PropsFromRedux, RouteComponentProps {}

export default function MagicLogin(props: MagicLoginProps): JSX.Element {
  useEffect(() => {
    if (props.auth.isLoggedIn) {
      props.push(Routes.Loading);
      return;
    }
  }, [props, props.auth.isLoggedIn]);

  useEffect(() => {
    if (props.auth.loginError) {
      props.push(Routes.Login);
    }
  }, [props, props.auth.loginError]);

  useEffect(() => {
    props.authenticateUserMagicLink(props.loginCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.loginCode]);

  return (
    <Container>
      <Title>Logging you in...</Title>
      <LoadingSpinner icon={faCircleNotch} spin />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div`
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 20px;
  margin-top: 62px;
  color: #fff;
`;

const LoadingSpinner = styled(FontAwesomeIcon)`
  margin: 0 auto;
  font-size: 2rem;
  color: #6772ef;
`;
