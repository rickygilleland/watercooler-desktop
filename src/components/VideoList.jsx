import React, { useState, useEffect } from 'react';
import Video from './Video';
import { computeScreenAwareSize } from 'custom-electron-titlebar/lib/common/dom';

function VideoList(props) {
    const { publishing, user, publishers, videoSizes, renderVideo, togglePinned, pinned, currentTime } = props;

    const [ processedPublishers, setProcessedPublishers ] = useState([...publishers]);

    useEffect(() => {
        if (processedPublishers.length != publishers.length) {
            return setProcessedPublishers([...publishers]);
        }

        let shouldUpdate = false;

        processedPublishers.forEach(processedPublisher => {
            publishers.forEach(publisher => {
                if (publisher.id == processedPublisher.id) {
                    shouldUpdate = processedPublisher.hasVideo != publisher.hasVideo;
                    shouldUpdate = processedPublisher.hasAudio != publisher.hasAudio;
                }
            })
        })

        if (shouldUpdate) {
            setProcessedPublishers([...publishers]);
        }
    })

    function checkVideoAudioStatus(publisher) {

        let videoLoading = false;
        let audioLoading = false;

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

        let updatedPublishers = [...processedPublishers];

        updatedPublishers.forEach(updatedPublisher => {
            if (updatedPublisher.id == publisher.id) {
                updatedPublisher.videoLoading = videoLoading;
                updatedPublisher.audioLoading = audioLoading;
            }
        })

        setProcessedPublishers(updatedPublishers);

        if (publisher.hasVideo && videoLoading == true) {
            return requestAnimationFrame(checkVideoAudioStatus(publisher));
        }

    }

    var showPinToggle = false;
    if (processedPublishers.length > 1) {
        showPinToggle = true;
    }
 
    if (pinned !== false || !showPinToggle) {
        var publisher = processedPublishers[0];
        if (pinned !== false) {
            publisher = processedPublishers[pinned];
        };

        if (typeof publisher.videoLoading == "undefined" || typeof publisher.audioLoading == "undefined") {
            checkVideoAudioStatus(publisher);
        }

        return(
            <Video
                showPinToggle={showPinToggle}
                videoSizes={videoSizes}
                publisher={publisher}
                renderVideo={renderVideo}
                togglePinned={togglePinned}
                publishing={publishing}
                speaking={typeof publisher.speaking != "undefined" ? publisher.speaking : false}
                currentTime={currentTime}
                localTimezone={user.timezone}
                active={typeof publisher.active != "undefined" ? publisher.active : false}
                hasVideo={typeof publisher.hasVideo != "undefined" ? publisher.hasVideo : false}
                hasAudio={typeof publisher.hasAudio != "undefined" ? publisher.hasAudio : false}
                videoLoading={typeof publisher.videoLoading != "undefined" ? publisher.videoLoading : true}
                audioLoading={typeof publisher.audioLoading != "undefined" ? publisher.audioLoading : true}
                videoIsFaceOnly={typeof publisher.videoIsFaceOnly != "undefined" && publishing ? publisher.videoIsFaceOnly : false}
                showBeforeJoin={publisher.id.includes("_screensharing") ? false : true}
                pinned={true}
                key={publisher.id}
                isLocal={publisher.member.id == user.id}
            ></Video>
        )
    }

    return(processedPublishers.map(publisher => {

        if (typeof publisher.videoLoading == "undefined" || typeof publisher.audioLoading == "undefined") {
            checkVideoAudioStatus(publisher);
        }

        return(
            <Video
                showPinToggle={showPinToggle}
                videoSizes={videoSizes}
                publisher={publisher}
                renderVideo={renderVideo}
                togglePinned={togglePinned}
                publishing={publishing}
                speaking={typeof publisher.speaking != "undefined" ? publisher.speaking : false}
                currentTime={currentTime}
                localTimezone={user.timezone}
                active={typeof publisher.active != "undefined" ? publisher.active : false}
                hasVideo={typeof publisher.hasVideo != "undefined" ? publisher.hasVideo : false}
                hasAudio={typeof publisher.hasAudio != "undefined" ? publisher.hasAudio : false}
                videoLoading={typeof publisher.videoLoading != "undefined" ? publisher.videoLoading : true}
                audioLoading={typeof publisher.audioLoading != "undefined" ? publisher.audioLoading : true}
                videoIsFaceOnly={typeof publisher.videoIsFaceOnly != "undefined" ? publisher.videoIsFaceOnly : false}
                showBeforeJoin={publisher.id.includes("_screensharing") ? false : true}
                pinned={false}
                key={publisher.id}
                isLocal={publisher.member.id == user.id}
            ></Video>
        )
    }))

    
}

export default VideoList;
