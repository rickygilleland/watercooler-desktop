import React from 'react';
import ReactPlayer from 'react-player/lazy'

export default class MessageMediaPlayer extends React.Component {

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    const { autoplay, controls, source, mediaType, id } = this.props;

    return (
      <div> 
        <ReactPlayer 
            url={source} 
            controls={true} 
            config={{
                file: {
                    forceVideo: mediaType == "video",
                    forceAudio: mediaType == "audio/wav"
                }
            }}
            height="45px"
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