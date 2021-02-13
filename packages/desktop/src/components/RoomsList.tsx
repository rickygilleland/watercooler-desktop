import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { PropsFromRedux } from "../containers/RoomsListPage";
import { Room } from "../store/types/room";
import { RouteComponentProps } from "react-router";
import { Routes } from "./RootComponent";
import { Team } from "../store/types/organization";
import { faMicrophoneAlt, faVideo } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

interface RoomsListProps extends PropsFromRedux, RouteComponentProps {
  activeTeam: Team | undefined;
  isLightMode: boolean;
  handleUserLogout(): void;
}

export default function RoomsList(props: RoomsListProps): JSX.Element {
  const { activeTeam } = props;

  const [rooms, setRooms] = useState<Room[] | undefined>(activeTeam?.rooms);

  useEffect(() => {
    setRooms(activeTeam?.rooms);
  }, [activeTeam?.rooms]);

  return (
    <Container>
      <Title>Rooms</Title>
      <RoomsContainer>
        {rooms?.map((room) => (
          <RoomButtonContainer
            key={room.id}
            to={{
              pathname: `/room/${room.slug}`,
            }}
          >
            <RoomTitleContainer>
              <FontAwesomeIcon
                icon={room.video_enabled ? faVideo : faMicrophoneAlt}
              />
              <RoomTitle>{room.name}</RoomTitle>
            </RoomTitleContainer>
          </RoomButtonContainer>
        ))}
        {rooms?.map((room) => (
          <RoomButtonContainer
            key={room.id}
            to={{
              pathname: `/room/${room.slug}`,
            }}
          >
            <RoomTitleContainer>
              <FontAwesomeIcon
                icon={room.video_enabled ? faVideo : faMicrophoneAlt}
              />
              <RoomTitle>{room.name}</RoomTitle>
            </RoomTitleContainer>
          </RoomButtonContainer>
        ))}
        {rooms?.map((room) => (
          <RoomButtonContainer
            key={room.id}
            to={{
              pathname: `/room/${room.slug}`,
            }}
          >
            <RoomTitleContainer>
              <FontAwesomeIcon
                icon={!room.video_enabled ? faVideo : faMicrophoneAlt}
              />
              <RoomTitle>{room.name}</RoomTitle>
            </RoomTitleContainer>
          </RoomButtonContainer>
        ))}
      </RoomsContainer>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  color: #fff;
  padding: 12px;
`;

const Title = styled.h1`
  font-size: 18px;
`;

const RoomsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const RoomButtonContainer = styled(Link)`
  display: flex;
  border: 1px solid rgb(255, 255, 255, 0.4);
  border-radius: 4px;
  margin: 12px 12px 12px 0;
  padding: 12px;
  min-width: 230px;
  width: 25%;
  transition: width 0.2s ease-out;
  transition: border 0.2s ease;
  color: #fff !important;
  &:hover {
    text-decoration: none;
    border: 1px solid #408af8;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const RoomTitleContainer = styled.div`
  display: flex;
  align-items: center;

  svg {
    margin-right: 6px;
  }
`;

const RoomTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
`;
