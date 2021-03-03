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
  setShowManageCameraModal(show: boolean): void;
  setShowRoomSettingsModal(show: boolean): void;
}

export default function UserSettings(props: UserSettingsProps): JSX.Element {
  const {
    handleUserLogout,
    setShowManageCameraModal,
    setShowRoomSettingsModal,
  } = props;

  return (
    <Container>
      <FormContainer>
        <StyledButton
          variant="dark"
          className="my-3"
          size="lg"
          block
          onClick={() => setShowManageCameraModal(true)}
        >
          <FontAwesomeIcon icon={faCamera} /> Camera Settings
        </StyledButton>
        <StyledButton
          variant="dark"
          className="my-3"
          size="lg"
          block
          onClick={() => setShowRoomSettingsModal(true)}
        >
          <FontAwesomeIcon icon={faDoorOpen} /> Room Settings
        </StyledButton>

        <LogoutButton variant="danger" onClick={() => handleUserLogout()}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
        </LogoutButton>
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
  height: calc(100vh - 90px);
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
`;

const StyledButton = styled(Button)`
  border: 1px solid rgb(255, 255, 255, 0.4);
  background-color: transparent;
  padding: 16px;
  font-size: 16px;
`;

const LogoutButton = styled(Button)`
  margin-top: auto !important;
`;
