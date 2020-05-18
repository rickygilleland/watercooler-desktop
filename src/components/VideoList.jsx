import React from 'react';
import Video from './Video';

function VideoList(props) {
    const { publishing, user, publishers, talking, videoSizes, renderVideo, currentTime } = props;

    return(publishers.map(publisher => {
        if (publisher.member.id != user.id) {
            return(
                <Video
                    videoSizes={videoSizes}
                    publisher={publisher}
                    renderVideo={renderVideo}
                    publishing={publishing}
                    talking={talking}
                    currentTime={currentTime}
                    localTimezone={user.timezone}
                    active={typeof publisher.active != "undefined" ? publisher.active : false}
                    hasVideo={typeof publisher.hasVideo != "undefined" ? publisher.hasVideo : false}
                    hasAudio={typeof publisher.hasAudio != "undefined" ? publisher.hasAudio : false}
                    showBeforeJoin={publisher.id.includes("_screensharing") ? false : true}
                    key={publisher.id}
                ></Video>
            )
        }
    }))

    
}

export default VideoList;
