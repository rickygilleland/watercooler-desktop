import React from 'react';
import { ipcRenderer } from 'electron';
import { 
    Container, 
    Button, 
    Row, 
    Col, 
    OverlayTrigger, 
    Tooltip,
    Dropdown
} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { 
    faCircleNotch, 
    faMicrophone, 
    faMicrophoneSlash, 
    faVideo, 
    faVideoSlash, 
    faDoorClosed, 
    faDoorOpen, 
    faUser, 
    faLock,
    faDesktop,
    faWindowMaximize
} from '@fortawesome/free-solid-svg-icons';

class ScreenShareControls extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            audioStatus: null,
            videoStatus: null,
            videoEnabled: null,
        }
    }

    componentDidMount() {
        ipcRenderer.invoke('update-screen-sharing-controls', { initial: true });

        ipcRenderer.on('update-screen-sharing-controls', (event, args) => {
            this.setState({ audioStatus: args.audioStatus, videoStatus: args.videoStatus, videoEnabled: args.videoEnabled });
        })
    }

    componentDidUpdate(prevProps, prevState) {
       
    }

    toggleScreenSharing() {
        ipcRenderer.invoke('update-screen-sharing-controls', { toggleScreenSharing: true });
    }

    toggleVideoOrAudio(type) {
        ipcRenderer.invoke('update-screen-sharing-controls', { toggleVideoOrAudio: type });
    }

    leaveRoom() {
        ipcRenderer.invoke('update-screen-sharing-controls', { leaveRoom: true });
    }

    render() {
        const { videoStatus, audioStatus, videoEnabled } = this.state;

        if (videoStatus == null) {
            return (
                <div className="vh-100" style={{backgroundColor:"#121422"}}></div>
            )
        }

        return(
            <div className="d-flex flex-row justify-content-center vh-100" style={{backgroundColor:"#121422"}}>
                <div className="align-self-start mt-1">
                <Button variant="outline-danger" style={{whiteSpace:'nowrap'}} className="mx-1" onClick={() => this.toggleScreenSharing() }><FontAwesomeIcon icon={faDesktop} /></Button>
                <Button variant={audioStatus ? "outline-success" : "outline-danger"} style={{whiteSpace:'nowrap'}} className="mx-1" onClick={() => this.toggleVideoOrAudio("audio")} ><FontAwesomeIcon icon={audioStatus ? faMicrophone : faMicrophoneSlash} /> </Button>
                {videoEnabled ?
                    <Button variant={videoStatus ? "outline-success" : "outline-danger"} className="mx-1" onClick={() => this.toggleVideoOrAudio("video") }><FontAwesomeIcon icon={videoStatus ? faVideo : faVideoSlash} /></Button>
                :
                <OverlayTrigger placement="bottom-start" overlay={<Tooltip id="tooltip-disabled">Video is disabled in this room.</Tooltip>}>
                    <span className="d-inline-block">
                    
                    <Button variant={videoStatus ? "outline-success" : "outline-danger"} className="mx-1" disabled style={{ pointerEvents: 'none' }}><FontAwesomeIcon icon={videoStatus ? faVideo : faVideoSlash} /></Button>
                    </span>
                </OverlayTrigger> 
                }
                <Button variant="outline-danger" style={{whiteSpace:'nowrap'}} className="mx-1"><FontAwesomeIcon icon={faDoorClosed} onClick={() => this.leaveRoom() } /> Leave</Button>
                </div>
            </div>
        )
    }
}

export default ScreenShareControls;