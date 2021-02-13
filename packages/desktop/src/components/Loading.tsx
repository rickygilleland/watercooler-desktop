import { Container } from "react-bootstrap";
import { PropsFromRedux } from "../containers/LoadingPage";
import CenteredLoadingSpinner from "./CenteredLoadingSpinner";
import React, { useEffect } from "react";
import routes from "../constants/routes.json";
import styled from "styled-components";

export default function Loading(props: PropsFromRedux): JSX.Element {
  useEffect(() => {
    if (!props.auth.isLoggedIn) {
      props.push("/login");
      return;
    }

    const fetchAll = async () => {
      const getUser = props.getUserDetails();
      const getOrganization = props.getOrganizations();
      const getOrganizationUser = props.getOrganizationUsers(
        props.organization.id,
      );

      await Promise.all([getUser, getOrganization, getOrganizationUser]);
      props.push(routes.TEAM);
      return;
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
