import { Container } from "react-bootstrap";
import { PropsFromRedux } from "../containers/RoomsListPage";
import { Routes } from "./RootComponent";
import React, { useEffect } from "react";
import styled from "styled-components";

interface RoomsListProps extends PropsFromRedux {
  isLightMode: boolean;
  userLogout(): void;
}

export default function RoomsList(props: RoomsListProps): JSX.Element {
  return null;
}
