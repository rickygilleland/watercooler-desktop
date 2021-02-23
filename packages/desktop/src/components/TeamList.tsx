import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "../store/types/user";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useGetCurrentTime } from "../hooks/team";
import Person from "./Person";
import React from "react";
import styled from "styled-components";

interface TeamListProps {
  users: User[] | undefined;
  user: User;
  onlineUsers: number[];
  setShowInviteUsersModal(show: boolean): void;
}

export default function TeamList(props: TeamListProps): JSX.Element {
  const { users, onlineUsers } = props;
  const currentTime = useGetCurrentTime(props.user.timezone);

  return (
    <Container>
      <PersonListContainer>
        {users &&
          users.map((teamUser) => (
            <Person
              key={teamUser.id}
              currentUser={props.user}
              user={teamUser}
              onlineUsers={onlineUsers}
              currentTime={currentTime}
            />
          ))}
      </PersonListContainer>
      <InviteUserButton onClick={() => props.setShowInviteUsersModal(true)}>
        <FontAwesomeIcon icon={faPlus} />
        <InviteUserButtonText>Invite Teammate</InviteUserButtonText>
      </InviteUserButton>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  color: #fff;
`;

const PersonListContainer = styled.div`
  height: calc(100vh - 140px);
  overflow: auto;
  padding: 12px;
`;

const InviteUserButton = styled.div`
  height: 50px;
  display: flex;
  position: fixed;
  bottom: 0;
  align-items: center;
  cursor: pointer;
  width: 100%;
  justify-content: center;
  background-color: rgb(40, 199, 93, 0.95);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgb(40, 199, 93, 0.65);
  }
`;

const InviteUserButtonText = styled.div`
  font-weight: 600;
  margin-left: 8px;
`;
