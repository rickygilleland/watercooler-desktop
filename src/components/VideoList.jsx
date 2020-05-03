import React from 'react';
import Video from './Video';

function VideoList(props) {
    const { publishers, videoSizes, renderVideo } = props;

    return(publishers.map(publisher => {
        return(
            <>
            <Video
                videoSizes={videoSizes}
                publisher={publisher}
                renderVideo={renderVideo}
                active={typeof publisher.active != "undefined" ? publisher.active : false}
                hasVideo={typeof publisher.hasVideo != "undefined" ? publisher.hasVideo : false}
                hasAudio={typeof publisher.hasAudio != "undefined" ? publisher.hasAudio : false}
                key={publisher.id}
            ></Video>
            </>
        )
    }))

    
}

export default VideoList;
