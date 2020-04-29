import React from 'react';
import { Image, Col, Row } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faVideoSlash, faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

function Video(props) {
    const { videoSizes, publisher, hasVideo, hasAudio, renderVideo } = props;

    if (typeof publisher.stream != "undefined" && publisher.stream != null) {

        if (hasVideo === true) {
            return (
                <div className="col p-0">
                    <div className="video-container mx-auto position-relative text-light"  style={{height: videoSizes.height, width: videoSizes.width }}>
                        <video autoPlay ref={renderVideo(publisher.stream)} className="rounded shadow" style={{height: videoSizes.height, width: videoSizes.width }}></video>
                        <div className="position-absolute overlay" style={{bottom:0,backgroundColor:"rgb(18, 20, 34, .5)",width:"100%"}}>
                            <Row>
                                <Col>
                                    <p className="pl-2 mb-1 mt-1 font-weight-bolder">{publisher.member.name}</p>
                                </Col>
                                <Col>
                                    <p className="pr-2 mb-1 mt-1 font-weight-bolder text-right">
                                        {publisher.hasAudio 
                                            ? 
                                                <FontAwesomeIcon style={{color:"#2eb97b"}} icon={faMicrophone} /> 
                                            : 
                                                <FontAwesomeIcon style={{color:"#f9426c"}} icon={faMicrophoneSlash} /> 
                                        }
                                    </p>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            )
        }

        return(
            <div className="col p-0">
                <div className="video-container rounded shadow mx-auto d-flex flex-column justify-content-center position-relative text-light" style={{height: videoSizes.height, width: videoSizes.width, backgroundColor:publisher.containerBackgroundColor }}>
                <video autoPlay ref={renderVideo(publisher.stream)} className="rounded shadow" style={{height: 0, width: 0 }}></video>
                    <div className="mx-auto align-self-center">
                        <Image src={publisher.member.avatar} style={{maxHeight:100}} fluid roundedCircle />
                    </div>
                    <div className="mx-auto align-self-center">
                        <p className="font-weight-bolder text-center" style={{paddingTop:8,fontSize:"1.4rem"}}><FontAwesomeIcon style={{color:"#f9426c"}} icon={faVideoSlash} /> Audio Only</p>
                    </div>
                    <div className="position-absolute overlay" style={{bottom:0,backgroundColor:"rgb(18, 20, 34, .5)",width:"100%"}}>
                        <Row>
                            <Col>
                                <p className="pl-2 mb-1 mt-1 font-weight-bolder">{publisher.member.name}</p>
                            </Col>
                            <Col>
                                <p className="pr-2 mb-1 mt-1 font-weight-bolder text-right">
                                    {publisher.hasAudio 
                                        ? 
                                            <FontAwesomeIcon style={{color:"#2eb97b"}} icon={faMicrophone} /> 
                                        : 
                                            <FontAwesomeIcon style={{color:"#f9426c"}} icon={faMicrophoneSlash} /> 
                                    }
                                </p>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        )
    }

    return(
        <div className="col p-0">
            <div className="video-container rounded shadow mx-auto d-flex flex-column justify-content-center position-relative text-light" style={{height: videoSizes.height, width: videoSizes.width, backgroundColor:publisher.containerBackgroundColor }}>
                <div className="mx-auto align-self-center">
                    <Image src={publisher.member.avatar} style={{maxHeight:100}} fluid roundedCircle />
                </div>
                <div className="position-absolute overlay" style={{bottom:0,backgroundColor:"rgb(18, 20, 34, .5)",width:"100%"}}>
                    <p className="pl-2 mb-1 mt-1 font-weight-bolder">{publisher.member.name}</p>
                </div>
            </div>
        </div>
    )

}

export default React.memo(Video);