import { Container } from "react-bootstrap";
import { PropsFromRedux } from "../containers/LoadingPage";
import { Routes } from "./RootComponent";
import CenteredLoadingSpinner from "./CenteredLoadingSpinner";
import React, { useEffect } from "react";
import styled from "styled-components";

export default function Loading(props: PropsFromRedux): JSX.Element {
  const { auth, getUserDetails, getOrganizations, push } = props;
  useEffect(() => {
    if (!auth.isLoggedIn) {
      push(Routes.Login);
      return;
    }

    const fetchAll = async () => {
      const getUser = getUserDetails();
      const getOrganization = getOrganizations();

      Promise.all([getUser, getOrganization]).then(() => push(Routes.Home));
    };

    fetchAll();
  }, [auth.isLoggedIn, getOrganizations, getUserDetails, push]);

  return (
    <Container data-tid="container" fluid>
      <Title className="mt-5">Loading Blab...</Title>
      <CenteredLoadingSpinner />
    </Container>
  );
}

const Title = styled.h1`
  text-align: center;
  color: #fff;
`;
