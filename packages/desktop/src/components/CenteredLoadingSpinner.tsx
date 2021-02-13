import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import styled from "styled-components";

export default function CenteredLoadingSpinner(): JSX.Element {
  return (
    <Container>
      <FontAwesomeIcon
        icon={faCircleNotch}
        className="mt-3"
        style={{ fontSize: "2.4rem", color: "#6772ef" }}
        spin
      />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
`;
