import React from 'react';
import Video from './Video';

function VideoList(props) {
    const { publishing, user, publishers, talking, videoSizes, renderVideo, togglePinned, pinned, currentTime } = props;

    var showPinToggle = false;
    if (publishers.length > 1) {
        showPinToggle = true;
    }

    if (pinned !== false || !showPinToggle) {
        var publisher = publishers[0];
        if (pinned !== false) {
            publisher = publishers[pinned];
        }
        return(
            <Video
                showPinToggle={showPinToggle}
                videoSizes={videoSizes}
                publisher={publisher}
                renderVideo={renderVideo}
                togglePinned={togglePinned}
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
                    showPinToggle={showPinToggle}
                    videoSizes={videoSizes}
                    publisher={publisher}
                    renderVideo={renderVideo}
                    togglePinned={togglePinned}
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
