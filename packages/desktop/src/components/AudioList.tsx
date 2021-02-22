import { Avatar, AvatarContainer } from "./Person";
import { Publisher } from "../hooks/room";
import { User } from "../store/types/user";
import AudioPlayer from "./AudioPlayer";
import React from "react";
import styled from "styled-components";

interface AudioListProps {
  publishing: boolean;
  user: User;
  publishers: Publisher[];
  speakingPublishers: string[];
}

export default function AudioList(props: AudioListProps): JSX.Element {
  return (
    <Container>
      {props.publishers.map((publisher) => (
        <AudioContainer key={publisher.id}>
          {publisher.member?.info?.avatar && (
            <AvatarContainer>
              <Avatar
                src={publisher.member?.info?.avatar}
                hasGreenBorder={props.speakingPublishers.includes(publisher.id)}
                hasRedBorder={!publisher.hasAudio}
              />
            </AvatarContainer>
          )}
          <Name>{`${publisher.member?.info?.first_name} ${publisher.member?.info?.last_name}`}</Name>
          <AudioPlayer
            user={props.user}
            stream={publisher.stream}
            publisherId={publisher.id}
          />
        </AudioContainer>
      ))}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 8px;
`;

const AudioContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
`;

const Name = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
`;
