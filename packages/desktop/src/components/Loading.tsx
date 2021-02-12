import { Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsFromRedux } from "../containers/LoadingPage";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { push } from "connected-react-router";
import React, { useEffect } from "react";
import routes from "../constants/routes.json";

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
      push(routes.TEAM);
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container data-tid="container" fluid>
      <h1 className="text-center mt-5">Loading Blab...</h1>
      <FontAwesomeIcon
        icon={faCircleNotch}
        className="mt-3"
        style={{ fontSize: "2.4rem", color: "#6772ef" }}
        spin
      />
    </Container>
  );
}
