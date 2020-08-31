import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Card, CardColumns, Navbar, Row, Col, OverlayTrigger, Overlay, Popover, Tooltip } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import RecordRTC from 'recordrtc';
import { StereoAudioRecorder } from 'recordrtc';
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
            timeInterval: null
        };

        this.startRecording = this.startRecording.bind(this);
    }

    componentDidMount() {
    }

    componentDidUpdate() {
    }

    componentWillUnmount() {
        const { timeInterval } = this.state;

        if (this.player) {
          this.player.dispose()
        }

        if (timeInterval != null) {
            clearInterval(timeInterval);
        }
    }

    async startRecording() {
        const { settings, user } = this.props;
        const { recorder, isRecording } = this.state;
        
        if (recorder !== null && isRecording) {
            recorder.stopRecording(function() {
                //upload the wav
                let blob = recorder.getBlob();
            })

            if (this.state.timeInterval != null) {
                clearInterval(this.state.timeInterval);
            }

            return this.setState({ recorder: null, isRecording: false, raw_local_stream: null, timeInterval: null, duration: "00:00" });
        }

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
       
        let recording = RecordRTC(raw_local_stream, {
            type: 'audio',
            mimeType: 'audio/wav',
            recorderType: StereoAudioRecorder,
            desiredSampRate: 16000
        });

        recording.startRecording();
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

        this.setState({ recorder: recording, isRecording: true, raw_local_stream, timeInterval });
        
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
                if (audio != null) { audio.srcObject = source }
            }
        )
    }

    render() {

        const { isRecording, raw_local_stream, duration } = this.state;

        return (
            <Row>
                <Col xs={{span:12}} className="text-center">
                    <Button variant={isRecording ? "danger" : "success"} style={{color:"#fff",fontSize:"2rem"}} className="mx-auto mt-3" onClick={() => this.startRecording()}>
                        <FontAwesomeIcon icon={isRecording ? faMicrophoneSlash : faMicrophone} />
                    </Button>
                    <Row>
                        <Col xs={{span:12}}>
                            {isRecording && (
                                <p style={{fontWeight:700,fontSize:"1.2em"}}>Recording Blab<br/> {duration} / 5:00</p>  
                            )}
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }

}

export default SendMessage;