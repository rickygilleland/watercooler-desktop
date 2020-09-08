import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { 
    Image, 
    Button, 
    Row, 
    Col, 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard, faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import MessageMediaPlayer from './MessageMediaPlayer';

class Message extends React.Component {

    constructor(props) {
        super(props);

        let date = DateTime.fromISO(this.props.message.created_at);

        this.state = {
            waveSurfer: null,
            formattedDate: date.toLocaleString(DateTime.TIME_SIMPLE),
            copied: false
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
        const { formattedDate, copied } = this.state;

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
                <Row style={{marginLeft: renderHeading ? 55 : 0}} className="mb-1">
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
                <Row className="mb-4">
                    {message.is_public == true && typeof message.public_url != "undefined" && (
                        <CopyToClipboard 
                            text={message.public_url}
                            onCopy={() => this.setState({copied: true})}
                        >
                            <Button variant="link" style={{marginLeft:60,fontSize:".8rem",color:copied ? "rgb(62, 207, 142)" : "#6772ef"}}>
                                <FontAwesomeIcon icon={copied ? faClipboardCheck : faClipboard} /> {copied ? 'Link Copied to Clipboard' : 'Copy Shareable Link to Clipboard'}
                            </Button>
                        </CopyToClipboard>
                    )}
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