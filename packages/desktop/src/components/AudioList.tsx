import { Avatar, AvatarContainer } from "./Person";
import { Publisher } from "../hooks/room";
import { User } from "../store/types/user";
import AudioPlayer from "./AudioPlayer";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

interface AudioListProps {
  publishing: boolean;
  user: User;
  publishers: Publisher[];
  speakingPublishers: string[];
}

export default function AudioList(props: AudioListProps): JSX.Element {
  const { publishers } = props;
  const [audioOnlyPublishers, setAudioOnlyPublishers] = useState<Publisher[]>(
    [],
  );

  useEffect(() => {
    const audioOnlyPublishers = publishers.filter(
      (publisher) => !publisher.hasVideo,
    );

    setAudioOnlyPublishers(audioOnlyPublishers);
  }, [publishers]);

  return (
    <Container>
      {audioOnlyPublishers.map((publisher) => (
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
          <Name>{publisher.member?.info?.first_name}</Name>
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
  flex-direction: column;
  margin-top: 12px;

  ${AvatarContainer} {
    margin-right: 0;
    height: 65px;
    width: 65px;
  }

  ${Avatar} {
    border-radius: 15px;
  }
`;

const Name = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  justify-self: center;
`;
