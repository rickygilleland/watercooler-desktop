import { DateTime } from "luxon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "../store/types/user";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useGetCurrentTime } from "../hooks/team";
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
            <PersonContainer key={teamUser.id}>
              <AvatarContainer>
                <Avatar src={teamUser.avatar_url} />
                <OnlineIndicator online={onlineUsers.includes(teamUser.id)} />
              </AvatarContainer>
              <NameTimeContainer>
                <Name>{`${teamUser.first_name} ${teamUser.last_name}`}</Name>
                {teamUser.timezone !== props.user.timezone && (
                  <Time>
                    Local time:{" "}
                    {currentTime
                      .setZone(teamUser.timezone)
                      .toLocaleString(DateTime.TIME_SIMPLE)}
                  </Time>
                )}
              </NameTimeContainer>
            </PersonContainer>
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

const PersonContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin: 20px 0;
`;

const NameTimeContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const AvatarContainer = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 12px;
`;

const Avatar = styled.img`
  border-radius: 50%;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const OnlineIndicator = styled.div<{
  online: boolean;
}>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.online ? "rgb(51, 255, 119, .95)" : "#f9426c"};
  border: 2px solid rgb(33, 37, 41, 0.6);
  left: 29px;
  bottom: 11px;
  position: relative;
`;

const Time = styled.div`
  font-size: 14px;
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
