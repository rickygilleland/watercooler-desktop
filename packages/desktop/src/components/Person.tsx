import { DateTime } from "luxon";
import { User } from "../store/types/user";
import React from "react";
import styled from "styled-components";

interface PersonProps {
  user: User;
  currentUser?: User;
  onlineUsers?: number[];
  currentTime?: DateTime;
}

export default function Person(props: PersonProps): JSX.Element {
  const { user, currentUser, onlineUsers, currentTime } = props;

  return (
    <PersonContainer key={user.id}>
      <AvatarContainer>
        <Avatar src={user.avatar_url} />
        {onlineUsers && (
          <OnlineIndicator online={onlineUsers.includes(user.id)} />
        )}
      </AvatarContainer>
      <NameTimeContainer>
        <Name>{`${user.first_name} ${user.last_name}`}</Name>
        {currentTime && user.timezone !== currentUser?.timezone && (
          <Time>
            Local time:{" "}
            {currentTime
              .setZone(user.timezone)
              .toLocaleString(DateTime.TIME_SIMPLE)}
          </Time>
        )}
      </NameTimeContainer>
    </PersonContainer>
  );
}

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

export const AvatarContainer = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 12px;
`;

export const Avatar = styled.img`
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
