import React from 'react';
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
    }

    componentDidMount() {
        

    }

    componentDidUpdate(prevProps, prevState) {
       
    }

    render() {

        return(
            <div className="d-flex flex-row justify-content-center vh-100" style={{backgroundColor:"#121422"}}>
                <div className="align-self-start mt-1">
                <Button variant="outline-danger" style={{whiteSpace:'nowrap'}} className="mx-1" ><FontAwesomeIcon icon={faDesktop} /></Button>
                <Button variant="outline-danger" style={{whiteSpace:'nowrap'}} className="mx-1" ><FontAwesomeIcon icon={faMicrophoneSlash} /> </Button>
                <Button variant="outline-danger" style={{whiteSpace:'nowrap'}} className="mx-1" ><FontAwesomeIcon icon={faVideoSlash} /> </Button>
                <Button variant="outline-danger" style={{whiteSpace:'nowrap'}} className="mx-1"><FontAwesomeIcon icon={faDoorClosed} /> Leave</Button>
                </div>
            </div>
        )
    }
}

export default ScreenShareControls;