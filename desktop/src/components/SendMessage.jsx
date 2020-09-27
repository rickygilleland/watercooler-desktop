import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Card, CardColumns, Navbar, Row, Col, OverlayTrigger, Overlay, Popover, Tooltip } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { 
    faMicrophone, 
    faMicrophoneSlash, 
    faCircle, 
    faCircleNotch, 
    faTimesCircle, 
    faPaperPlane, 
    faTrashAlt, 
    faSave, 
    faGlobe, 
    faVideo, 
    faVideoSlash,
    faDesktop
} from '@fortawesome/free-solid-svg-icons';
import ScreenSharingModal from './ScreenSharingModal';
import MessageMediaPlayer from './MessageMediaPlayer';
import RecordRTC, { MediaStreamRecorder, StereoAudioRecorder } from 'recordrtc';
import posthog from 'posthog-js';
if (process.env.REACT_APP_PLATFORM != "web") {
    var { desktopCapturer } = require('electron');
} else {
    var desktopCapturer = null;
}

class SendMessage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            recorder: null,
            isRecording: false,
            recordingType: null,
            raw_local_stream: null,
            duration: "00:00",
            timeInterval: null,
            recordingBlob: null,
            recordingBlobUrl: null,
            loadingRecording: false,
            showDeleteConfirm: false,
            showScreenSharingModal: false,
            screenSources: [],
            screenSourcesLoading: false,
            showVideoPreview: false,
            videoPreviewLoading: false,
            localVideoCanvas: null,
            localVideoContainer: null,
            showMessageEditor: false,
        };

        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.clearRecording = this.clearRecording.bind(this);
        this.sendRecording = this.sendRecording.bind(this);
        this.loadVideoPreview = this.loadVideoPreview.bind(this);
        this.cleanUpStreams = this.cleanUpStreams.bind(this);

        this._mounted = false;
    }

    componentDidMount() {
        this._mounted = true;
    }

    componentDidUpdate(prevProps, prevState) {
        const { messageCreating, threadId, libraryItemCreating } = this.props;
        const { showVideoPreview } = this.state;

        if (showVideoPreview && prevState.showVideoPreview == false) {
            this.loadVideoPreview();
        }

        if (!showVideoPreview && prevState.showVideoPreview) {
            this.cleanUpStreams();
        }  

        if (!prevProps.messageCreating && messageCreating && typeof threadId != "undefined") {
            this.clearRecording();
        }

        if (!prevProps.libraryItemCreating && libraryItemCreating) {
            this.clearRecording();
        }

    }

    componentWillUnmount() {

        if (this.player) {
          this.player.dispose()
        }

        this._mounted = false;

        this.stopRecording();
        this.cleanUpStreams();
    }

    cleanUpStreams() {
        const { raw_local_stream, local_stream, raw_video_stream, localVideoCanvas, timeInterval, localVideoContainer } = this.state;

        if (raw_local_stream != null) {
            const tracks = raw_local_stream.getTracks();

            tracks.forEach(function(track) {
                track.stop();
            })
        }    

        if (local_stream != null) {
            const localTracks = local_stream.getTracks();

            localTracks.forEach(track => {
                track.stop();
            })
        }

        if (raw_video_stream != null) {
            const videoStreamTracks = raw_video_stream.getTracks();

            videoStreamTracks.forEach(track => {
                track.stop();
            })
        }

        if (timeInterval != null) {
            clearInterval(timeInterval);
        }

        if (localVideoCanvas != null) {
            localVideoCanvas.remove();
        }

        if (localVideoContainer != null) {
            localVideoContainer.remove();
        }

        this.setState({ 
            raw_local_stream: null, 
            local_stream: null, 
            raw_video_stream: null, 
            timeInterval: null, 
            localVideoCanvas: null, 
            localVideoContainer: null
        })
    }

    async loadVideoPreview() {
        const { settings } = this.props;

        this.setState({ videoPreviewLoading: true });

        let streamOptions;
        
        if (settings.defaultDevices != null && Object.keys(settings.defaultDevices).length !== 0) {
            streamOptions = {
                video: {
                    aspectRatio: 1.3333333333,
                    deviceId: settings.defaultDevices.videoInput
                },
                audio: {
                    deviceId: settings.defaultDevices.audioInput
                }
            }
        } else {
            streamOptions = {
                video: {
                    aspectRatio: 1.3333333333
                },
                audio: true
            }
        }

        const raw_video_stream = await navigator.mediaDevices.getUserMedia(streamOptions); 

        var localVideoContainer = document.createElement("video");
        localVideoContainer.srcObject = raw_video_stream;
        localVideoContainer.muted = true;
        localVideoContainer.autoplay = true;
        localVideoContainer.setAttribute('playsinline', '');
        localVideoContainer.play();

        var localVideoCanvas = document.createElement("canvas");
        var ctx = localVideoCanvas.getContext('2d');

        localVideoContainer.onloadedmetadata = () => {
            localVideoContainer.width = localVideoContainer.videoWidth;
            localVideoContainer.height = localVideoContainer.videoHeight;
            localVideoCanvas.width = localVideoContainer.width;
            localVideoCanvas.height = localVideoContainer.height;
        }

        localVideoContainer.onplaying = async () => {

            const drawVideo = () => {

                if (this._mounted == false) {
                    return false;
                }
    
                ctx.translate(localVideoContainer.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(localVideoContainer, 0, 0);
                ctx.setTransform(1,0,0,1,0,0);
                return requestAnimationFrame(drawVideo);
            }
    
            drawVideo();
    
            let local_stream = localVideoCanvas.captureStream();
            let raw_tracks = raw_video_stream.getAudioTracks();
            raw_tracks.forEach(track => {
                local_stream.addTrack(track);
            })
    
            this.setState({ raw_video_stream, raw_local_stream: local_stream, localVideoCanvas, localVideoContainer, videoPreviewLoading: false });

        }

    }

    async startRecording(recordingType) {
        const { settings, user, messageCreatedStateChange, threadId } = this.props;

        var streamOptions;
        var raw_local_stream = null;

        if (recordingType == "audio") {
            if (settings.defaultDevices != null && Object.keys(settings.defaultDevices).length !== 0) {
                streamOptions = {
                    video: false,
                    audio: {
                        deviceId: settings.defaultDevices.audioInput
                    }
                }
            } else {
                streamOptions = {
                    video: false,
                    audio: true
                }
            }
    
            raw_local_stream = await navigator.mediaDevices.getUserMedia(streamOptions); 

            this.setState({ raw_local_stream });
        }

        if (raw_local_stream == null) {
            raw_local_stream = this.state.raw_local_stream;
        }
       
        let recorder = RecordRTC(this.state.raw_local_stream, {
            type: recordingType == "video" ? 'video' : 'audio',
            mimeType: recordingType == "video" ? process.env.REACT_APP_PLATFORM == "web" ? 'video/webm;codecs=vp8' : 'video/webm;codecs=vp9' : 'audio/wav',
            recorderType: recordingType == "video" ? MediaStreamRecorder : StereoAudioRecorder,
            disableLogs: true
        });

        recorder.startRecording();
        let startTime = Date.now();

        this.setState({ startTime });

        let timeInterval = setInterval(function () {

            if (this.state.startTime == null) {
                return true;
            }

            let currentTime = Date.now();
            let diff = currentTime - this.state.startTime;

            this.calculateTimeDuration(diff/1000);

        }.bind(this), 1000);

        this.setState({ 
            recorder, 
            isRecording: true, 
            timeInterval, 
            recordingBlob: null, 
            recordingBlobUrl: null, 
            overrideExpanded: true, 
            recordingType,
            showMessageEditor: false
        });
        
    }

    async stopRecording() {
        const { recorder, isRecording, raw_local_stream, local_stream, raw_video_stream, startTime } = this.state;

        this.setState({ loadingRecording: true });
        
        if (recorder !== null && isRecording) {
            recorder.stopRecording(() => {
                let recordingBlob = recorder.getBlob();
                let recordingBlobUrl = recorder.toURL();

                recorder.destroy();

                this.cleanUpStreams();
    
                this.setState({ 
                    recorder: null, 
                    isRecording: false, 
                    duration: "00:00", 
                    recordingBlob, 
                    recordingBlobUrl ,
                    loadingRecording: false,
                    showVideoPreview: false,
                })

            })
        }
    }

    clearRecording() {
        this.setState({ 
            recordingBlob: null, 
            recordingBlobUrl: null, 
            showDeleteConfirm: false, 
            recordingType: null, 
            showVideoPreview: false, 
            showMessageEditor: true 
        })
    }

    sendRecording() {
        const { messageCreatedStateChange, createMessage, organization, recipients, threadId, isLibrary, createItem } = this.props;
        const { recordingBlob, recordingType } = this.state;

        if (recordingType == "audio") {
            var attachment = new File([recordingBlob], 'blab.wav', {
                type: 'audio/wav'
            });
        } else {
            var attachment = new File([recordingBlob], 'blab.mp4', {
                type: 'video/mp4'
            });
        }
    
        var formData = new FormData();
        formData.append('attachment', attachment);

        if (isLibrary) {
            return createItem(formData);
        } 

        var message;

        if (typeof threadId != "undefined") {
            message = {
                organization_id: organization.id,
                is_public: false,
                thread_id: threadId,
                attachment
            }
        } else {
            message = {
                organization_id: organization.id,
                is_public: false,
                recipient_ids: recipients,
                attachment
            }
        }

        for ( var key in message ) {
            if (key == "recipient_ids") {
                message[key].forEach((recipient, index) => {
                    formData.append(`recipient_ids[${index}]`, recipient);
                })
            } else {
                formData.append(key, message[key]);
            }
        }

        messageCreatedStateChange();

        return createMessage(formData);
    }

    calculateTimeDuration(secs) {

        if (secs > 300) {
            this.stopRecording();
        }

        var min = Math.floor(secs / 60);
        var sec = Math.floor(secs - (min * 60));
    
        if (min < 10) {
            min = "0" + min;
        }
    
        if (sec < 10) {
            sec = "0" + sec;
        }

        let duration = min + ':' + sec;

        this.setState({ duration });
    
    }

    async getAvailableScreensToShare() {

        var screenSources = [];

        const sources = await desktopCapturer.getSources({
            types: ['window', 'screen'],
            thumbnailSize: { width: 1000, height: 1000 },
            fetchWindowIcons: true
        });

        sources.forEach(source => {
            if (!source.name.includes("Blab")) {
                var icon = null;
                if (source.appIcon != null) {
                    icon = source.appIcon.toDataURL();
                }

                if (source.name != null && source.name.length > 50) {
                    source.name = source.name.slice(0, 49);
                    source.name = source.name.trim() + "...";
                }

                var newSource = {
                    icon,
                    display_id: source.display_id,
                    id: source.id,
                    name: source.name,
                    thumbnail: source.thumbnail.toDataURL()
                }
                screenSources.push(newSource);
            }
        })

        this.setState({ screenSources, screenSourcesLoading: false })
    }

    
    renderStream(source) {
        const { recordingType } = this.state;

        if (recordingType == "video") {
            return (
                video => {
                    if (video != null) { video.src = source }
                }
            )
        }

        return(
            audio => {
                if (audio != null) { audio.src = source }
            }
        )
    }

    renderPreviewStream(source) {
        return (
            video => {
                if (video != null) { video.srcObject = source }
            }
        )
    }

    render() {
        const { messageCreating, recipients, isLibrary, threadId, threadName, isNewThread, libraryItemCreating } = this.props;
        const { 
            isRecording, 
            recordingBlob, 
            recordingBlobUrl, 
            duration, 
            loadingRecording, 
            showDeleteConfirm, 
            overrideExpanded, 
            recordingType,
            showScreenSharingModal,
            showVideoPreview,
            videoPreviewLoading,
            raw_local_stream,
            showMessageEditor
        } = this.state;

        /*
        if (showMessageEditor && (typeof threadId != "undefined" || isNewThread)) {
            return (
                <MessageEditor 
                    threadName={threadName} 
                    handleSendMessage={(message) => {
                        console.log("MESSAGE", message);
                    }}
                    handleMicrophoneClick={() => {
                        this.startRecording("audio");
                    }}
                    handleVideoClick={() => {
                        this.setState({ showVideoPreview: true, showMessageEditor: false })
                    }}
                />
            )
        }*/

        if ((messageCreating && typeof threadId == "undefined") || loadingRecording) {
            return(
                <Card className="border-0" style={{height: recordingType == "video" ? 475 : 190,backgroundColor:"transparent",borderRadius:0}}>
                    <Row className="mt-3 mb-4">
                        <Col xs={{span:12}} className="text-center">
                            <p style={{fontSize:"1.2rem",fontWeight:700}}>{loadingRecording ? 'Creating' : 'Uploading'} Blab...</p>
                            <FontAwesomeIcon icon={faCircleNotch} className="mt-3 mx-auto" style={{fontSize:"2.4rem",color:"#6772ef"}} spin />
                        </Col>
                    </Row>
                </Card>
            )
        }

        if (showVideoPreview) {
            return(
                <Card className="border-0" style={{height: 475,backgroundColor:"transparent",borderRadius:0}}>
                    <Row className="mt-3 mb-4">
                        <Col xs={{span:12}} className="text-center">
                            <div className="mx-auto" style={{height:350,width:466}}>
                                {videoPreviewLoading && (
                                    <>
                                        <p className="text-center" style={{fontSize:"1.2rem",fontWeight:700}}>Loading camera preview...</p>
                                        <FontAwesomeIcon icon={faCircleNotch} className="mx-auto" style={{fontSize:"3rem",color:"#6772ef"}} spin />
                                    </>
                                )}
                                {videoPreviewLoading == false && (
                                    <MessageMediaPlayer
                                        autoplay={true}
                                        controls={false}
                                        source={raw_local_stream}
                                        mediaType="video/mp4"
                                        muted={true}
                                    />
                                )}
                            </div>
                            <div className="mx-auto">
                                {isRecording == false && (
                                    <Button
                                        variant="danger"
                                        className="mx-2 mt-3"
                                        style={{color:"#fff",fontSize:"1.3rem",minWidth:"3.2rem",minHeight:"3.2rem"}} 
                                        onClick={() => this.setState({ showVideoPreview: false })}
                                    >
                                        <FontAwesomeIcon icon={faTimesCircle} />
                                    </Button>
                                )}
                                <Button 
                                    variant={isRecording ? "danger" : "success"} 
                                    style={{color:"#fff",fontSize:"1.3rem",minWidth:"3.2rem",minHeight:"3.2rem"}} 
                                    className="mx-2 mt-3" 
                                    onClick={() => !isRecording ? this.startRecording("video") : this.stopRecording()}
                                    disabled={videoPreviewLoading}
                                >
                                    <FontAwesomeIcon icon={isRecording ? faVideoSlash : faVideo} />
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card>
            )
        }

        return (
            <Card className="border-0" style={{height: recordingType == "video" && recordingBlob != null ? 475 : isRecording || recordingBlob != null ? 190 : 85,backgroundColor:"transparent",borderRadius:0}}>
                <Row className="mb-4">
                    <Col xs={{span:12}} className="text-center">
                        {recordingBlobUrl == null && (
                            <div className="mx-auto">
                                {!isRecording && (
                                    <>
                                        <Button variant={isRecording ? "danger" : "success"} style={{color:"#fff",fontSize:"1.3rem",minWidth:"3.2rem",minHeight:"3.2rem"}} className="mx-2 mt-3" onClick={() => this.setState({ showVideoPreview: true })}>
                                            <FontAwesomeIcon icon={isRecording ? faVideoSlash : faVideo} />
                                        </Button>
                                    </>
                                )}
                                <Button variant={isRecording ? "danger" : "success"} style={{color:"#fff",fontSize:"1.3rem",minWidth:"3.2rem",minHeight:"3.2rem"}} className="mx-2 mt-3" onClick={() => !isRecording ? this.startRecording("audio") : this.stopRecording()}>
                                    <FontAwesomeIcon icon={isRecording ? faMicrophoneSlash : faMicrophone} />
                                </Button>
                            </div>
                        )}
                        {recordingBlobUrl != null && !showDeleteConfirm && (
                            <div className="mx-auto">
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip id="tooltip-delete-button">
                                            Delete this Blab.
                                        </Tooltip>
                                    }
                                    >
                                    <Button variant="danger" style={{color:"#fff",fontSize:"1rem",minWidth:"3rem",minHeight:"3rem"}} className="mx-2 mt-3" onClick={() => this.setState({ showDeleteConfirm: true })}>
                                        <FontAwesomeIcon icon={faTimesCircle} style={{fontSize:"1.5rem"}} /><br />
                                    </Button>
                                </OverlayTrigger>
                                {isLibrary == false && (
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip id="tooltip-send-button">
                                                {recipients.length == 0 && typeof threadId == "undefined"
                                                    ? 'Select a recipient to send this Blab.' 
                                                    : `Send this Blab`}
                                            </Tooltip>
                                        }
                                        >
                                        <Button variant="success" style={{color:"#fff",fontSize:"1.3rem",minWidth:"3rem",minHeight:"3rem"}} disabled={recipients.length == 0 && typeof threadId == "undefined"} className="mx-2 mt-3" onClick={() => this.sendRecording()}>
                                            <FontAwesomeIcon icon={faPaperPlane} />
                                        </Button>
                                    </OverlayTrigger>
                                )}
                                {isLibrary && (
                                    <Button variant="success" style={{color:"#fff",fontSize:"1.3rem",minWidth:"3rem",minHeight:"3rem"}} className="mx-2 mt-3" onClick={() => this.sendRecording()}>
                                        <FontAwesomeIcon icon={faSave} />
                                    </Button>
                                )}
                            </div>
                        )}
                        {showDeleteConfirm && (
                            <div className="mx-auto">
                                <p className="mb-0" style={{fontWeight:700,fontSize:"1.2rem"}}>Are you sure you want to delete this Blab?<br /><small>This cannot be undone.</small></p>
                                <Button variant="danger" style={{color:"#fff",fontSize:"1.3rem",minWidth:"3rem",minHeight:"3rem"}} className="mx-2 mt-3" onClick={() => this.clearRecording()}>
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </Button>
                                <Button variant="success" style={{color:"#fff",fontSize:"1.3rem",minWidth:"3rem",minHeight:"3rem"}} className="mx-2 mt-3" onClick={() => this.setState({ showDeleteConfirm: false })}>
                                    <FontAwesomeIcon icon={faSave} />
                                </Button>
                            </div>
                        )}
                        {!showDeleteConfirm && (
                            <Row className="mt-3">
                                <Col xs={{span:12}}>
                                    {isRecording && (
                                        <p style={{fontWeight:700,fontSize:"1.2em"}}><FontAwesomeIcon icon={faCircle} className="mr-1" style={{color:"#f9426c",fontSize:".5rem",verticalAlign:'middle'}} /> Recording Blab<br/> {duration} / 5:00</p>  
                                    )}
                                    {recordingBlobUrl && (
                                        <div className="mx-auto" style={{height: recordingType == "video" ? 350 : 50, width: recordingType == "video" ? 466 : 466}}>
                                            <MessageMediaPlayer
                                                autoplay={false}
                                                controls={true}
                                                source={recordingBlobUrl}
                                                mediaType={recordingType == "video" ? "video/mp4" : "audio/wav"}
                                                muted={false}
                                            />
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        )}
                    </Col>
                </Row>
            </Card>
        )
    }

}

export default SendMessage;