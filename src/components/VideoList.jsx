import React from 'react';
import Video from './Video';

function VideoList(props) {
    const { publishers, videoSizes, renderVideo } = props;

    return(publishers.map(publisher => {
        return(
            <Video
                videoSizes={videoSizes}
                publisher={publisher}
                renderVideo={renderVideo}
                key={publisher.id}
            ></Video>
        )
    }))

    
}

export default VideoList;
