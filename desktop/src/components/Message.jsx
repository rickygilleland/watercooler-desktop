import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Card, CardColumns, Navbar, Row, Col, OverlayTrigger, Overlay, Popover, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faCircle, faCircleNotch, faTimesCircle, faPaperPlane, faTrashAlt, faSave, faGlobe } from '@fortawesome/free-solid-svg-icons';
import videojs from 'video.js'
import posthog from 'posthog-js';

class Message extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
    }

    componentDidUpdate() {
    }

    componentWillUnmount() {
    }

    render() {
        const { message } = this.props;

        return (
            <>
                <Row>
                    <Image src={message.user.avatar_url} fluid style={{height:40}} />
                    <p style={{paddingLeft:12,marginTop:5}}>
                        <span style={{fontSize:"1.0rem",fontWeight:700}}>
                            {message.user.first_name} {message.user.last_name}
                        </span> 
                        <span style={{fontSize:".7rem"}}>
                            10:30PM
                        </span>
                    </p>
                </Row>
                <Row>
                    <audio controls src={message.attachment_url} />
                </Row>
            </>
        )

        /*
        return (
            <div className="d-flex flex-row justify-content-start"></div>
            <Row key={key}>              
                <Col xs={2} className="pr-0">
                    <Image src={message.user.avatar_url} fluid style={{height:60}} />
                    <p style={{fontSize:"1.2rem",fontWeight:600}}>{message.user.first_name} {message.user.last_name}</p>
                </Col>
                <Col xs={10} className="pl-0">
                    <p style={{fontSize:"1.2rem",fontWeight:600}}>{message.user.first_name} {message.user.last_name}</p>
                    <audio controls src={message.attachment_url} />
                </Col>
            </Row>
        )*/
    }

}

export default Message;