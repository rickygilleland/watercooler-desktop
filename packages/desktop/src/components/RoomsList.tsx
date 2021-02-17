import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { Room } from "../store/types/room";
import {
  faMicrophoneAlt,
  faPlus,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { ipcRenderer } from "electron";
import React from "react";
import styled from "styled-components";

interface RoomsListProps {
  rooms: Room[] | undefined;
  setShowCreateRoomForm(show: boolean): void;
}

export default function RoomsList(props: RoomsListProps): JSX.Element {
  const { rooms } = props;

  const handleWindowWidthChange = () => {
    ipcRenderer.invoke("update-main-window-width", {
      type: "full",
    });
  };

  return (
    <Container>
      {!rooms && <Title>No rooms yet.</Title>}
      {rooms && (
        <RoomsContainer>
          {rooms?.map((room) => (
            <RoomButtonContainer
              key={room.id}
              onClick={() => {
                if (room.video_enabled) {
                  handleWindowWidthChange();
                }
              }}
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
        </RoomsContainer>
      )}
      <NewRoomButton onClick={() => props.setShowCreateRoomForm(true)}>
        <FontAwesomeIcon icon={faPlus} />
        <NewRoomButtonText>Create Room</NewRoomButtonText>
      </NewRoomButton>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  color: #fff;
`;

const Title = styled.h1`
  font-size: 18px;
`;

const RoomsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: calc(100vh - 140px);
  overflow: auto;
  padding: 12px;
`;

const RoomButtonContainer = styled(Link)`
  display: flex;
  border: 1px solid rgb(255, 255, 255, 0.4);
  border-radius: 4px;
  margin: 12px 12px 12px 0;
  padding: 12px;
  min-width: 230px;
  max-height: 120px;
  width: 25%;
  transition: width 0.2s ease;
  transition: border 0.2s ease;
  color: #fff !important;
  &:hover {
    text-decoration: none;
    border: 1px solid #408af8;
  }

  @media (max-width: 480px) {
    width: 100%;
    margin-right: 0;
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

const NewRoomButton = styled.div`
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

const NewRoomButtonText = styled.div`
  font-weight: 600;
  margin-left: 8px;
`;
