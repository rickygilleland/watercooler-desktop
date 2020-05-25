import React from 'react';
import { Image, Col, Row, Button } from 'react-bootstrap';
import { DateTime } from 'luxon';
import VideoPlayer from './VideoPlayer';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { 
    faVideoSlash, 
    faMicrophone, 
    faMicrophoneSlash, 
    faCircleNotch,
    faExpand,
    faCompress
} from '@fortawesome/free-solid-svg-icons';

function Video(props) {
    const { 
        showPinToggle,
        showBeforeJoin,
        videoSizes, 
        publisher, 
        localTimezone, 
        currentTime,
        publishing, 
        talking,
        hasVideo, 
        hasAudio, 
        renderVideo,
        togglePinned,
        pinned
    } = props;

    var classAppend = '';

    if (talking.includes(publisher.id)) {
        classAppend = "border border-success";
    }
    
    if (typeof publisher.stream != "undefined" && publisher.stream != null) {

        var videoLoading = false;
        var audioLoading = false;

        var tracks = publisher.stream.getTracks();

        if (tracks.length == 0) {
            videoLoading = true;
            audioLoading = true;
        }

        tracks.forEach(function(track) {
            if (track.type == "video" && track.muted) {
                videoLoading = true;
            } 

            if (track.type == "audio" && track.muted) {
                audioLoading = true;
            }
        })

        var height = videoSizes.height;


        if (hasVideo === true && !videoLoading) {
            return (
                <div className="col p-0 video-col">
                    <div className={`video-container mx-auto position-relative rounded text-light ${classAppend}`}  style={{height: pinned ? videoSizes.pinnedHeight : height, width: pinned ? videoSizes.pinnedWidth : videoSizes.width }}>
                        <VideoPlayer renderVideo={renderVideo} stream={publisher.stream} publisher={publisher} />
                        <div className="position-absolute overlay" style={{top:5,width:"100%"}}>	
                            {publisher.member.timezone != null && publisher.member.timezone != localTimezone ? 	
                            <p className="pl-2 mb-1 mt-1 font-weight-bolder"><span className="p-2 rounded" style={{backgroundColor:"rgb(18, 20, 34, .5)"}}>{currentTime.setZone(publisher.member.timezone).toLocaleString(DateTime.TIME_SIMPLE)}</span></p>	
                            : ''}	
                        </div>
                        <div className="position-absolute overlay" style={{bottom:5,width:"100%"}}>
                            <Row>
                                <Col>
                                    <p className="pl-2 mb-1 mt-1 font-weight-bolder"><span className="p-2 rounded" style={{backgroundColor:"rgb(18, 20, 34, .5)"}}>{publisher.id.includes("_screensharing") ? publisher.member.first_name + "'s Screen" : publisher.member.first_name}</span></p>
                                </Col>
                                <Col>
                                    {/*<p className="pr-2 mb-1 mt-1 font-weight-bolder text-right">
                                        <span className="p-2 rounded" style={{backgroundColor:"rgb(18, 20, 34, .5)"}}>
                                            {publisher.hasAudio 
                                                ? 
                                                    <FontAwesomeIcon style={{color:"#2eb97b"}} icon={faMicrophone} /> 
                                                : 
                                                    <FontAwesomeIcon style={{color:"#f9426c"}} icon={faMicrophoneSlash} /> 
                                            }
                                        </span>
                                    </p>*/}
                                    {showPinToggle 
                                        ?
                                            pinned 
                                                ?
                                                    <Button variant="dark" className="float-right mb-1 mr-2 toggle-pinned-btn border-0" onClick={() => togglePinned(publisher) }><FontAwesomeIcon icon={faCompress} /></Button>
                                                :
                                                    <Button variant="dark" className="float-right mb-1 mr-2 toggle-pinned-btn border-0" onClick={() => togglePinned(publisher) }><FontAwesomeIcon icon={faExpand} /></Button>
                                        : 
                                            ''
                                    }
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            )
        }

        if (!audioLoading) {
            return(
                <div className="col p-0 video-col">
                    <div className={`video-container rounded shadow mx-auto d-flex flex-column justify-content-center position-relative text-light ${classAppend}`} style={{height: videoSizes.height, width: videoSizes.width, backgroundColor:publisher.containerBackgroundColor }}>
                        <div className="position-absolute overlay" style={{top:5,width:"100%"}}>	
                            {publisher.member.timezone != null && publisher.member.timezone != localTimezone ? 	
                            <p className="pl-2 mb-1 mt-1 font-weight-bolder"><span className="p-2 rounded" style={{backgroundColor:"rgb(18, 20, 34, .5)"}}>{currentTime.setZone(publisher.member.timezone).toLocaleString(DateTime.TIME_SIMPLE)}</span></p>	
                            : ''}	
                        </div>
                        <video autoPlay ref={renderVideo(publisher.stream)} className="rounded shadow" style={{height: 0, width: 0 }}></video>
                        <div className="mx-auto align-self-center">
                            <Image src={publisher.member.avatar} style={{maxHeight:75}} fluid roundedCircle />
                        </div>
                        <div className="mx-auto align-self-center">
                            <p className="font-weight-bolder text-center" style={{paddingTop:8,fontSize:"1.2rem"}}><FontAwesomeIcon style={{color:"#f9426c"}} icon={faVideoSlash} /> Audio Only</p>
                        </div>
                        <div className="position-absolute overlay" style={{bottom:5,width:"100%"}}>
                            <Row>
                                <Col>
                                    <p className="pl-2 mb-1 mt-1 font-weight-bolder"><span className="p-2 rounded" style={{backgroundColor:"rgb(18, 20, 34, .5)"}}>{publisher.member.first_name}</span></p>
                                </Col>
                                <Col>
                                    {/*<p className="pr-2 mb-1 mt-1 font-weight-bolder text-right">
                                        <span className="p-2 rounded" style={{backgroundColor:"rgb(18, 20, 34, .5)"}}>
                                            {publisher.hasAudio 
                                                ? 
                                                    <FontAwesomeIcon style={{color:"#2eb97b"}} icon={faMicrophone} /> 
                                                : 
                                                    <FontAwesomeIcon style={{color:"#f9426c"}} icon={faMicrophoneSlash} /> 
                                            }
                                        </span>
                                    </p>*/}
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            )
        }
    }

    if (showBeforeJoin == false) {
        return(null);
    }

    return(
        <div className="col p-0 video-col">
            <div className="video-container rounded shadow mx-auto d-flex flex-column justify-content-center position-relative text-light" style={{height: videoSizes.height, width: videoSizes.width, backgroundColor:publisher.containerBackgroundColor }}>
                <div className="position-absolute overlay" style={{top:5,width:"100%"}}>	
                    {publisher.member.timezone != null && publisher.member.timezone != localTimezone ? 	
                    <p className="pl-2 mb-1 mt-1 font-weight-bolder"><span className="p-2 rounded" style={{backgroundColor:"rgb(18, 20, 34, .5)"}}>{currentTime.setZone(publisher.member.timezone).toLocaleString(DateTime.TIME_SIMPLE)}</span></p>	
                    : ''}	
                </div>
                <div className="mx-auto align-self-center">
                    <Image src={publisher.member.avatar} style={{maxHeight:75}} fluid roundedCircle />
                </div>
                {publishing ?
                    <div className="mx-auto align-self-center">
                        <p className="font-weight-bolder text-center" style={{paddingTop:8,fontSize:"1.2rem"}}><FontAwesomeIcon style={{color:"#f9426c"}} icon={faCircleNotch} spin/> Loading...</p>
                    </div>
                : '' }
                <div className="position-absolute overlay" style={{bottom:5,width:"100%"}}>
                    <p className="pl-2 mb-1 mt-1 font-weight-bolder"><span className="p-2 rounded" style={{backgroundColor:"rgb(18, 20, 34, .5)"}}>{publisher.member.first_name}</span></p>
                </div>
            </div>
        </div>
    )

}

export default React.memo(Video);