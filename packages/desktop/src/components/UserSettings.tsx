import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faDoorOpen,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import styled from "styled-components";

interface UserSettingsProps {
  handleUserLogout(): void;
}

export default function UserSettings(props: UserSettingsProps): JSX.Element {
  const { handleUserLogout } = props;

  return (
    <Container>
      <FormContainer>
        <Button variant="primary" className="my-3" size="lg" block>
          <FontAwesomeIcon icon={faCamera} /> Camera Settings
        </Button>
        <Button variant="primary" className="my-3" size="lg" block>
          <FontAwesomeIcon icon={faDoorOpen} /> Room Settings
        </Button>

        <Button
          variant="danger"
          className="mt-3"
          onClick={() => handleUserLogout()}
        >
          <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
        </Button>
      </FormContainer>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  color: #fff;
`;

const FormContainer = styled.div`
  height: calc(100vh - 140px);
  overflow: auto;
  padding: 12px;
`;
