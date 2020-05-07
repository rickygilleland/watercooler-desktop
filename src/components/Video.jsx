import React from 'react';
import { Image, Col, Row } from 'react-bootstrap';
import { DateTime } from 'luxon';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faVideoSlash, faMicrophone, faMicrophoneSlash, faCircleNotch } from '@fortawesome/free-solid-svg-icons';

function Video(props) {
    const { 
        videoSizes, 
        publisher, 
        talking,
        localTimezone, 
        currentTime,
        publishing, 
        hasVideo, 
        hasAudio, 
        renderVideo 
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

        if (hasVideo === true && !videoLoading) {
            return (
                <div className="col p-0 video-col">
                    <div className={`video-container mx-auto position-relative text-light ${classAppend}`}  style={{height: videoSizes.height, width: videoSizes.width }}>
                        <div className="position-absolute overlay" style={{top:5,width:"100%"}}>	
                            {publisher.member.timezone != null && publisher.member.timezone != localTimezone ? 	
                            <p className="pl-2 mb-1 mt-1 font-weight-bolder"><span className="p-2 rounded" style={{backgroundColor:"rgb(18, 20, 34, .5)"}}>{currentTime.setZone(publisher.member.timezone).toLocaleString(DateTime.TIME_SIMPLE)}</span></p>	
                            : ''}	
                        </div>
                        <video autoPlay ref={renderVideo(publisher.stream)} className="rounded shadow" style={{height: videoSizes.height, width: videoSizes.width }}></video>
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