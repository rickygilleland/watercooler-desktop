import React from 'react';
import Video from './Video';

function VideoList(props) {
    const { publishing, user, publishers, talking, videoSizes, renderVideo, togglePinned, pinned, currentTime } = props;

    let hasVideo = false;
    let hasAudio = false;
    var videoLoading = false;
    var audioLoading = false;

    var showPinToggle = false;
    if (publishers.length > 1) {
        showPinToggle = true;
    }

    if (pinned !== false || !showPinToggle) {
        var publisher = publishers[0];
        if (pinned !== false) {
            publisher = publishers[pinned];
        };

        if (typeof publisher.stream != "undefined" && publisher.stream != null) {
            let tracks = publisher.stream.getTracks();

            tracks.forEach(function(track) {
                if (track.kind == "video") {
                    videoLoading = track.muted;
                } 

                if (track.kind == "audio") {
                    audioLoading = track.muted;
                } 
            })
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
                videoLoading={videoLoading}
                audioLoading={audioLoading}
                showBeforeJoin={publisher.id.includes("_screensharing") ? false : true}
                pinned={true}
                key={publisher.id}
                isLocal={publisher.member.id == user.id}
            ></Video>
        )
    }

    return(publishers.map(publisher => {

        if (typeof publisher.stream != "undefined" && publisher.stream != null) {
            let tracks = publisher.stream.getTracks();

            tracks.forEach(function(track) {
                if (track.kind == "video") {
                    videoLoading = track.muted;
                } 

                if (track.kind == "audio") {
                    audioLoading = track.muted;
                } 
            })
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
                videoLoading={videoLoading}
                audioLoading={audioLoading}
                showBeforeJoin={publisher.id.includes("_screensharing") ? false : true}
                pinned={false}
                key={publisher.id}
                isLocal={publisher.member.id == user.id}
            ></Video>
        )
    }))

    
}

export default VideoList;
