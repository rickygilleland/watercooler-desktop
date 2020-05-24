import React from 'react';
import Video from './Video';

function VideoList(props) {
    const { publishing, user, publishers, talking, videoSizes, renderVideo, currentTime, pinned } = props;

    if (pinned !== false) {
        var publisher = publishers[pinned];
        console.log("VIDE PUB", publishers);
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
                pinned={true}
                key={publisher.id}
            ></Video>
        )
    }

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
                    pinned={false}
                    key={publisher.id}
                ></Video>
            )
        }
    }))

    
}

export default VideoList;
