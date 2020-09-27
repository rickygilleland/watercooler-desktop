import React from 'react';
import ReactPlayer from 'react-player'
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
    const { autoplay, controls, source, mediaType, muted, thumbnail } = this.props;

    return (
      <div className={(mediaType == "video/mp4" ? 'react-video-player-wrapper' : 'react-audio-player-wrapper')}> 
        <ReactPlayer 
            url={source} 
            controls={controls}
            playing={autoplay} 
            muted={muted}
            config={{
                file: {
                    forceVideo: mediaType == "video/mp4",
                    forceAudio: mediaType == "audio/wav",
                    attributes: {
                        controlsList: 'nodownload'
                    }
                }
            }}
            height="100%"
            width="100%"
            poster={mediaType == "video/mp4" ? thumbnail : undefined}
            className="mx-auto react-player"
        />
      </div>
    )

  }

}