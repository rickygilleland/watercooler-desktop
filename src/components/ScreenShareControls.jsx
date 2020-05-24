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
            videoStatus: null
        }
    }

    componentDidMount() {
        ipcRenderer.invoke('update-screen-sharing-controls', { initial: true });

        ipcRenderer.on('update-screen-sharing-controls', (event, args) => {
            console.log("RECEIVED");
            this.setState({ audioStatus: args.audioStatus, videoStatus: args.videoStatus });
        })
    }

    componentDidUpdate(prevProps, prevState) {
       
    }

    render() {
        const { videoStatus, audioStatus } = this.state;

        if (videoStatus == null) {
            return (
                <div className="vh-100" style={{backgroundColor:"#121422"}}></div>
            )
        }

        return(
            <div className="d-flex flex-row justify-content-center vh-100" style={{backgroundColor:"#121422"}}>
                <div className="align-self-start mt-1">
                <Button variant="outline-danger" style={{whiteSpace:'nowrap'}} className="mx-1" ><FontAwesomeIcon icon={faDesktop} /></Button>
                <Button variant={audioStatus ? "outline-success" : "outline-danger"} style={{whiteSpace:'nowrap'}} className="mx-1" ><FontAwesomeIcon icon={audioStatus ? faMicrophone : faMicrophoneSlash} /> </Button>
                <Button variant={videoStatus ? "outline-success" : "outline-danger"} style={{whiteSpace:'nowrap'}} className="mx-1" ><FontAwesomeIcon icon={faVideoSlash} /> </Button>
                <Button variant="outline-danger" style={{whiteSpace:'nowrap'}} className="mx-1"><FontAwesomeIcon icon={faDoorClosed} /> Leave</Button>
                </div>
            </div>
        )
    }
}

export default ScreenShareControls;