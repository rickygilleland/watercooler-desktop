import React from 'react';
import Video from './Video';

function VideoList(props) {
    const { publishing, user, publishers, videoSizes, renderVideo } = props;

    return(publishers.map(publisher => {
        if (publisher.member.id != user.id) {
            return(
                <Video
                    videoSizes={videoSizes}
                    publisher={publisher}
                    renderVideo={renderVideo}
                    publishing={publishing}
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
