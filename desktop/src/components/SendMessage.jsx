import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Card, CardColumns, Navbar, Row, Col, OverlayTrigger, Overlay, Popover, Tooltip } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faCircle, faCircleNotch, faTimesCircle, faPaperPlane, faTrashAlt, faSave, faGlobe } from '@fortawesome/free-solid-svg-icons';
import RecordRTC from 'recordrtc';
import { StereoAudioRecorder } from 'recordrtc';
import posthog from 'posthog-js';

class SendMessage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            recorder: null,
            isRecording: false,
            raw_local_stream: null,
            duration: "00:00",
            timeInterval: null,
            recordingBlob: null,
            recordingBlobUrl: null,
            loadingRecording: false,
            showDeleteConfirm: false,
            overrideExpanded: false,
        };

        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.clearRecording = this.clearRecording.bind(this);
        this.sendRecording = this.sendRecording.bind(this);
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        const { messageOpened } = this.props;
        const { overrideExpanded } = this.state;

        if (typeof messageOpened != "undefined" && overrideExpanded != prevState.overrideExpanded) {
            messageOpened();
        }
    }

    componentWillUnmount() {
        if (this.player) {
          this.player.dispose()
        }

        this.stopRecording();
    }

    async startRecording() {
        const { settings, user } = this.props;

        let streamOptions;
        
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

        const raw_local_stream = await navigator.mediaDevices.getUserMedia(streamOptions); 
       
        let recorder = RecordRTC(raw_local_stream, {
            type: 'audio',
            mimeType: 'audio/wav',
            recorderType: StereoAudioRecorder,
            desiredSampRate: 16000,
            numberOfAudioChannels: 1,
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

        this.setState({ recorder, isRecording: true, raw_local_stream, timeInterval, recordingBlob: null, recordingBlobUrl: null, overrideExpanded: true });
        
    }

    async stopRecording() {
        const { recorder, isRecording, raw_local_stream, startTime } = this.state;

        this.setState({ loadingRecording: true });
        
        if (recorder !== null && isRecording) {
            recorder.stopRecording(() => {
                let recordingBlob = recorder.getBlob();
                let recordingBlobUrl = recorder.toURL();

                recorder.destroy();

                if (raw_local_stream != null) {
                    const tracks = raw_local_stream.getTracks();
        
                    tracks.forEach(function(track) {
                        track.stop();
                    })
                }    
    
                if (this.state.timeInterval != null) {
                    clearInterval(this.state.timeInterval);
                }
    
                this.setState({ 
                    recorder: null, 
                    isRecording: false, 
                    raw_local_stream: null, 
                    timeInterval: null, 
                    duration: "00:00", 
                    recordingBlob, 
                    recordingBlobUrl ,
                    loadingRecording: false
                })

            })
        }
    }

    clearRecording() {
        const { expanded } = this.props;
        this.setState({ recordingBlob: null, recordingBlobUrl: null, showDeleteConfirm: false, overrideExpanded: expanded })
    }

    sendRecording(isPublic = false) {
        const { messageCreatedStateChange, createMessage, organization, recipients } = this.props;
        const { recordingBlob } = this.state;

        var attachment = new File([recordingBlob], 'blab.wav', {
            type: 'audio/wav'
        });
    
        var formData = new FormData();
        formData.append('attachment', attachment);

        let message = {
            organization_id: organization.id,
            is_public: isPublic,
            recipient_ids: recipients,
            attachment
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

        if (this.props.expanded == false) {
            this.setState({ overrideExpanded: false });
        }

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
    
    renderStream(source) {
        return(
            audio => {
                if (audio != null) { audio.src = source }
            }
        )
    }

    render() {
        const { messageCreating, recipients, recipientName, expanded } = this.props;
        const { isRecording, recordingBlob, recordingBlobUrl, duration, loadingRecording, showDeleteConfirm, overrideExpanded } = this.state;

        if (messageCreating || loadingRecording) {
            return(
                <Card style={{height: 190,backgroundColor:"#1b1e2f",borderRadius:0}}>
                    <Row className="mt-3 mb-4">
                        <Col xs={{span:12}} className="text-center">
                            <p className="text-light" style={{fontSize:"1.2rem",fontWeight:700}}>{loadingRecording ? 'Creating' : 'Uploading'} Blab...</p>
                            <FontAwesomeIcon icon={faCircleNotch} className="mt-3 mx-auto" style={{fontSize:"2.4rem",color:"#6772ef"}} spin />
                        </Col>
                    </Row>
                </Card>
            )
        }

        if (expanded == false && overrideExpanded == false) {
            return (
                <Card style={{height: 85,backgroundColor:"#1b1e2f",borderRadius:0}}>
                    <Row className="mt-3 mb-4">
                        <Col xs={{span:12}} className="text-center">
                            <Button variant={isRecording ? "danger" : "success"} style={{color:"#fff",fontSize:"1.5rem",minWidth:"3.2rem",minHeight:"3.2rem"}} className="mx-auto" onClick={() => !isRecording ? this.startRecording() : this.stopRecording()}>
                                <FontAwesomeIcon icon={isRecording ? faMicrophoneSlash : faMicrophone} />
                            </Button>
                        </Col>
                    </Row>
                </Card>
            )
        }

        return (
            <Card style={{height: 190,backgroundColor:"#1b1e2f",borderRadius:0}}>
                <Row className="mt-3 mb-4">
                    <Col xs={{span:12}} className="text-center">
                        {recordingBlobUrl == null && (
                            <Button variant={isRecording ? "danger" : "success"} style={{color:"#fff",fontSize:"1.5rem",minWidth:"3.2rem",minHeight:"3.2rem"}} className="mx-auto mt-3" onClick={() => !isRecording ? this.startRecording() : this.stopRecording()}>
                                <FontAwesomeIcon icon={isRecording ? faMicrophoneSlash : faMicrophone} />
                            </Button>
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
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip id="tooltip-send-button">
                                            {recipients.length == 0 
                                                ? 'Select a recipient to send this Blab, or use the globe button to get a shareable link.' 
                                                : `Send this Blab to ${recipientName}`}
                                        </Tooltip>
                                    }
                                    >
                                    <Button variant="success" style={{color:"#fff",fontSize:"1.3rem",minWidth:"3rem",minHeight:"3rem"}} disabled={recipients.length == 0} className="mx-2 mt-3" onClick={() => this.sendRecording()}>
                                        <FontAwesomeIcon icon={faPaperPlane} />
                                    </Button>
                                </OverlayTrigger>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip id="tooltip-make-public-button">
                                            Get a shareable public link for this Blab for sharing outside of the Blab app.
                                        </Tooltip>
                                    }
                                    >
                                    <Button variant="success" style={{color:"#fff",fontSize:"1.3rem",minWidth:"3rem",minHeight:"3rem"}} className="mx-2 mt-3" onClick={() => this.sendRecording(true)}>
                                        <FontAwesomeIcon icon={faGlobe} />
                                    </Button>
                                </OverlayTrigger>
                            </div>
                        )}
                        {showDeleteConfirm && (
                            <div className="mx-auto">
                                <p className="text-light mb-0" style={{fontWeight:700,fontSize:"1.2rem"}}>Are you sure you want to delete this Blab?<br /><small>This cannot be undone.</small></p>
                                <Button variant="danger" style={{color:"#fff",fontSize:"1.5rem",minWidth:"3rem",minHeight:"3rem"}} className="mx-2 mt-3" onClick={() => this.clearRecording()}>
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </Button>
                                <Button variant="success" style={{color:"#fff",fontSize:"1.5rem",minWidth:"3rem",minHeight:"3rem"}} className="mx-2 mt-3" onClick={() => this.setState({ showDeleteConfirm: false })}>
                                    <FontAwesomeIcon icon={faSave} />
                                </Button>
                            </div>
                        )}
                        {!showDeleteConfirm && (
                            <Row className="mt-3 text-light">
                                <Col xs={{span:12}}>
                                    {!isRecording && !recordingBlobUrl && (
                                        <p className="text-light mb-0" style={{fontWeight:700,fontSize:"1.2rem"}}>Click the microphone to start recording your Blab.</p>
                                    )}
                                    {isRecording && (
                                        <p style={{fontWeight:700,fontSize:"1.2em"}}><FontAwesomeIcon icon={faCircle} className="mr-1" style={{color:"#f9426c",fontSize:".5rem",verticalAlign:'middle'}} /> Recording Blab<br/> {duration} / 5:00</p>  
                                    )}
                                    {recordingBlobUrl && (
                                        <audio controls ref={this.renderStream(recordingBlobUrl)} />
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