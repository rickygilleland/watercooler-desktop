import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { 
    Container, 
    Image, 
    Button, 
    Card, 
    CardColumns, 
    Navbar, 
    Row, 
    Col, 
    OverlayTrigger, 
    Overlay, 
    Popover, 
    Tooltip 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMicrophone, 
    faMicrophoneSlash, 
    faCircle, 
    faCircleNotch, 
    faTimesCircle, 
    faPaperPlane, 
    faTrashAlt, 
    faSave, 
    faGlobe 
} from '@fortawesome/free-solid-svg-icons';
import MessageMediaPlayer from './MessageMediaPlayer';

class Message extends React.Component {

    constructor(props) {
        super(props);

        let date = DateTime.fromISO(this.props.message.created_at);

        this.state = {
            waveSurfer: null,
            formattedDate: date.toLocaleString(DateTime.TIME_SIMPLE)
        };
    }

    componentDidMount() {
    }

    componentDidUpdate() {
        const { message } = this.props;
    }

    componentWillUnmount() {
    }

    render() {
        const { message, renderHeading } = this.props;
        const { formattedDate } = this.state;

        return (
            <>
                {renderHeading && (
                    <Row style={{marginLeft: 0}}>
                        <div style={{width:50}}>
                            <Image src={message.user.avatar_url} fluid style={{height:40}} />
                        </div>  
                        <p style={{paddingLeft:5,marginTop:5}}>
                            <span style={{fontSize:"1.0rem",fontWeight:700}}>
                                {message.user.first_name} {message.user.last_name}
                            </span> 
                            <span style={{fontSize:".7rem"}}>
                                {formattedDate}
                            </span>
                        </p>
                    </Row>
                )}
                <Row style={{marginLeft: renderHeading ? 55 : 0}} className="mb-4">
                    {!renderHeading && (
                        <p className="align-self-center mb-0 mr-2" style={{fontSize:".7rem",width:50}}>{formattedDate}</p>
                    )}
                    <MessageMediaPlayer
                        autoplay={false}
                        controls={true}
                        source={message.attachment_url}
                        mediaType="audio/wav"
                        id={`video_player_${message.id}`}
                    />
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