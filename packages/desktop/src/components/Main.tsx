import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsFromRedux } from "../containers/MainPage";
import { Room } from "../store/types/room";
import { RouteComponentProps } from "react-router";
import { Team } from "../store/types/organization";
import { User } from "../store/types/user";
import { faCommentAlt, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import CreateRoomForm from "./CreateRoomForm";
import React, { useEffect, useState } from "react";
import RoomsList from "./RoomsList";
import TeamList from "./TeamList";
import styled from "styled-components";

interface MainProps extends PropsFromRedux, RouteComponentProps {
  activeTeam: Team | undefined;
  isLightMode: boolean;
  organizationUsersOnline: number[];
  handleUserLogout(): void;
  setShowInviteUsersModal(show: boolean): void;
  setShowCreateRoomForm(show: boolean): void;
  showCreateRoomForm: boolean;
}

enum Tab {
  Rooms,
  Team,
}

export default function Main(props: MainProps): JSX.Element {
  const {
    activeTeam,
    organizationUsers,
    organizationUsersOnline,
    user,
    showCreateRoomForm,
    setShowCreateRoomForm,
    billing,
    organizationLoading,
    createRoomSuccess,
    lastCreatedRoomSlug,
    createRoom,
  } = props;

  const [rooms, setRooms] = useState<Room[] | undefined>(activeTeam?.rooms);
  const [activeTab, setActiveTab] = useState(Tab.Rooms);

  const [filteredOrganizationUsers, setFilteredOrganizationUsers] = useState<
    User[] | undefined
  >();

  useEffect(() => {
    setRooms(activeTeam?.rooms);
  }, [activeTeam?.rooms]);

  useEffect(() => {
    const filteredOrganizationUsers = organizationUsers.filter(
      (organizationUser) => organizationUser.id !== user.id,
    );
    setFilteredOrganizationUsers(filteredOrganizationUsers);
  }, [organizationUsers, user.id]);

  if (showCreateRoomForm) {
    return (
      <CreateRoomForm
        loading={organizationLoading}
        billing={billing}
        createRoomSuccess={createRoomSuccess}
        lastCreatedRoomSlug={lastCreatedRoomSlug}
        handleSubmit={createRoom}
        push={props.push}
        onHide={() => setShowCreateRoomForm(false)}
      />
    );
  }

  return (
    <Container>
      <Menu>
        <MenuButton
          active={activeTab === Tab.Rooms}
          onClick={() => setActiveTab(Tab.Rooms)}
        >
          <FontAwesomeIcon icon={faCommentAlt} />
          <MenuTitle active={activeTab === Tab.Rooms}>Rooms</MenuTitle>
        </MenuButton>
        <MenuButton
          active={activeTab === Tab.Team}
          onClick={() => setActiveTab(Tab.Team)}
        >
          <FontAwesomeIcon icon={faUserFriends} />
          <MenuTitle active={activeTab === Tab.Team}>Team</MenuTitle>
        </MenuButton>
      </Menu>
      {activeTab === Tab.Rooms && (
        <RoomsList
          rooms={rooms}
          setShowCreateRoomForm={props.setShowCreateRoomForm}
        />
      )}
      {activeTab === Tab.Team && filteredOrganizationUsers && (
        <TeamList
          users={filteredOrganizationUsers}
          onlineUsers={organizationUsersOnline}
          user={user}
          setShowInviteUsersModal={props.setShowInviteUsersModal}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  color: #fff;
`;

const Menu = styled.div`
  width: 100%;
  display: flex;
  height: 50px;
  justify-content: center;
  align-items: center;
  border-bottom: 1.5px solid rgb(255, 255, 255, 0.3);
  margin-top: 10px;
  user-select: none;
`;

const MenuButton = styled.div<{
  active: boolean;
}>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 26px;
  cursor: pointer;

  transition: color 0.3s ease;

  color: ${(props) => (props.active ? "rgb(51, 255, 119, .95)" : "#fff")};
  svg {
    fill: ${(props) => (props.active ? "rgb(51, 255, 119, .95)" : "#fff")};
    transition: fill 0.3s ease;
  }

  &:hover {
    color: ${(props) => (props.active ? undefined : "rgb(51, 255, 119, .85)")};
    svg {
      fill: ${(props) => (props.active ? undefined : "rgb(51, 255, 119, .85)")};
    }
  }
`;

const MenuTitle = styled.p<{
  active: boolean;
}>`
  font-weight: ${(props) => (props.active ? 700 : 600)};
  margin-top: 4px;
`;
