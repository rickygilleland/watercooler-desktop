import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Card, CardColumns, Navbar, Row, Col, OverlayTrigger, Overlay, Popover, Tooltip } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faCircle, faCircleNotch, faTimesCircle, faPaperPlane, faTrashAlt, faSave } from '@fortawesome/free-solid-svg-icons';
import RecordRTC from 'recordrtc';
import { StereoAudioRecorder } from 'recordrtc';
import Autosuggest from 'react-autosuggest';
import videojs from 'video.js'
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
        };

        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.clearRecording = this.clearRecording.bind(this);
        this.sendRecording = this.sendRecording.bind(this);
    }

    componentDidMount() {
    }

    componentDidUpdate() {
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
            desiredSampRate: 16000
        });

        recorder.startRecording();
        let startTime = Date.now();

        this.setState({ startTime });

        /*const videoJsOptions = {
            autoplay: false,
            controls: false,
            sources: [{
              src: '/path/to/video.mp4',
              type: 'audio/wav'
            }]
        }
          

        this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
            console.log('onPlayerReady', this)
        });*/

        let timeInterval = setInterval(function () {

            if (this.state.startTime == null) {
                return true;
            }

            let currentTime = Date.now();
            let diff = currentTime - this.state.startTime;

            this.calculateTimeDuration(diff/1000);

        }.bind(this), 1000);

        this.setState({ recorder, isRecording: true, raw_local_stream, timeInterval, recordingBlob: null, recordingBlobUrl: null });
        
    }

    async stopRecording() {
        const { recorder, isRecording, raw_local_stream } = this.state;
        
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
                    recordingBlobUrl 
                })
            })
        }
    }

    clearRecording() {
        this.setState({ recordingBlob: null, recordingBlobUrl: null, showDeleteConfirm: false })
    }

    sendRecording() {

    }

    calculateTimeDuration(secs) {
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

        const { isRecording, recordingBlob, recordingBlobUrl, duration, loadingRecording, showDeleteConfirm } = this.state;

        return (
            <Card className="mt-auto" style={{height: 190,backgroundColor:"#1b1e2f",borderRadius:0}}>
                <Row className="mt-3 mb-4">
                    <Col xs={{span:12}} className="text-center">
                        {loadingRecording && (
                            <FontAwesomeIcon icon={faCircleNotch} className="mt-3 mx-auto" style={{fontSize:"2.4rem",color:"#6772ef"}} spin />
                        )}
                        {recordingBlobUrl == null && (
                            <Button variant={isRecording ? "danger" : "success"} style={{color:"#fff",fontSize:"1.8rem",minWidth:"4rem",minHeight:"4rem"}} className="mx-auto mt-3" onClick={() => !isRecording ? this.startRecording() : this.stopRecording()}>
                                <FontAwesomeIcon icon={isRecording ? faMicrophoneSlash : faMicrophone} />
                            </Button>
                        )}
                        {recordingBlobUrl != null && !showDeleteConfirm && (
                            <div className="mx-auto">
                                <Button variant="danger" style={{color:"#fff",fontSize:"1rem",minWidth:"4rem",minHeight:"4rem"}} className="mx-3 mt-3" onClick={() => this.setState({ showDeleteConfirm: true })}>
                                    <FontAwesomeIcon icon={faTimesCircle} style={{fontSize:"2.2rem"}} /><br />
                                </Button>
                                <Button variant="success" style={{color:"#fff",fontSize:"1.8rem",minWidth:"4rem",minHeight:"4rem"}} className="mx-3 mt-3" onClick={() => this.sendRecording()}>
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </Button>
                            </div>
                        )}
                        {showDeleteConfirm && (
                            <div className="mx-auto">
                                <p className="text-light mb-0" style={{fontWeight:700,fontSize:"1.2rem"}}>Are you sure you want to delete this Blab?<br /><small>This cannot be undone.</small></p>
                                <Button variant="danger" style={{color:"#fff",fontSize:"2rem",minWidth:"4rem",minHeight:"4rem"}} className="mx-3 mt-3" onClick={() => this.clearRecording()}>
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </Button>
                                <Button variant="success" style={{color:"#fff",fontSize:"2rem",minWidth:"4rem",minHeight:"4rem"}} className="mx-3 mt-3" onClick={() => this.setState({ showDeleteConfirm: false })}>
                                    <FontAwesomeIcon icon={faSave} />
                                </Button>
                            </div>
                        )}
                        {!showDeleteConfirm && (
                            <Row className="mt-3 text-light">
                                <Col xs={{span:12}}>
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