import React from 'react';
import ReactPlayer from 'react-player/lazy'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { 
    faCircleNotch, 
} from '@fortawesome/free-solid-svg-icons';

export default class MessageMediaPlayer extends React.Component {

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    const { autoplay, controls, source, mediaType, muted } = this.props;

    return (
      <div> 
        <ReactPlayer 
            url={source} 
            controls={controls}
            playing={autoplay} 
            muted={muted}
            config={{
                file: {
                    forceVideo: mediaType == "video/webm",
                    forceAudio: mediaType == "audio/wav",
                    attributes: {
                        controlsList: 'nodownload'
                    }
                }
            }}
            height={mediaType == "video/webm" ? "100%" : 45}
            width={mediaType == "video/webm" ? "100%" : undefined}
        />
      </div>
    )

  }

}
/*
autoplay={false}
controls={true}
source={message.attachment_url}
mediaType="audio/wav"
id={`video_player_${message.id}`}*/