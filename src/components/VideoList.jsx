import React from 'react';
import Video from './Video';

function VideoList(props) {
    const { publishing, user, publishers, videoSizes, renderVideo, currentTime } = props;

    return(publishers.map(publisher => {
        if (publisher.member.id != user.id) {
            return(
                <Video
                    videoSizes={videoSizes}
                    publisher={publisher}
                    renderVideo={renderVideo}
                    publishing={publishing}
                    localTimezone={user.timezone}
                    currentTime={currentTime}
                    active={typeof publisher.active != "undefined" ? publisher.active : false}
                    hasVideo={typeof publisher.hasVideo != "undefined" ? publisher.hasVideo : false}
                    hasAudio={typeof publisher.hasAudio != "undefined" ? publisher.hasAudio : false}
                    key={publisher.display}
                ></Video>
            )
        }
    }))

    
}

export default VideoList;
