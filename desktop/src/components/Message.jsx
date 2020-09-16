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
import { faClipboard, faClipboardCheck, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import MessageMediaPlayer from './MessageMediaPlayer';

class Message extends React.PureComponent {

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

    componentDidUpdate(prevProps) {
        const { message, lastCopiedMessageId } = this.props;
        const { copied } = this.state;

        if (prevProps.lastCopiedMessageId != lastCopiedMessageId && lastCopiedMessageId != message.id && copied) {
            this.setState({ copied: false });
        }
    }

    componentWillUnmount() {
    }

    render() {
        const { message, renderHeading, handleCopyToClipbard } = this.props;
        const { formattedDate, copied } = this.state;

        return (
            <>
                {renderHeading && (
                    <Row style={{marginLeft: 0}}>
                        <div style={{width:50}}>
                            <Image src={message.user.avatar_url} fluid style={{height:50,borderRadius:5}} />
                        </div>  
                        <p style={{paddingLeft:5,marginTop:5}}>
                            <span style={{fontSize:"1.0rem",fontWeight:700}}>
                                {message.user.first_name} {message.user.last_name}
                            </span> 
                            <span style={{fontSize:".7rem",paddingLeft:5}}>
                                {formattedDate}
                            </span>
                        </p>
                    </Row>
                )}
                <Row style={{marginLeft: renderHeading ? 55 : 0}} className="mb-1">
                    {!renderHeading && (
                        <p className="align-self-center mb-0 mr-2" style={{fontSize:".7rem",width:50}}>{formattedDate}</p>
                    )}
                    {message.attachment_processed == true && (
                        <div style={{height:message.attachment_mime_type == "video/mp4" ? 350 : undefined,width:message.attachment_mime_type == "video/mp4" ? 466 : undefined}}>
                            <MessageMediaPlayer
                                autoplay={false}
                                controls={true}
                                source={message.attachment_temporary_url}
                                mediaType={message.attachment_mime_type}
                                thumbnail={message.attachment_thumbnail_url}
                                id={`video_player_${message.id}`}
                            />
                        </div>
                    )}
                    {message.attachment_processed == false && (
                        <p style={{paddingTop:15,fontWeight:700}}>Video Processing <FontAwesomeIcon icon={faCircleNotch} style={{color:"#6772ef"}} spin /><br /><small>The video will appear here automatically shortly...</small></p>
                    )}
                </Row>
                <Row className="mb-4">
                    {message.is_public == true && typeof message.public_url != "undefined" && (
                        <CopyToClipboard 
                            text={message.public_url}
                            onCopy={() => { 
                                this.setState({copied: true}); 
                                handleCopyToClipbard(message.id) 
                            }}
                        >
                            <Button variant="link" style={{marginLeft:60,fontSize:".8rem",color:copied ? "rgb(62, 207, 142)" : "#6772ef"}}>
                                <FontAwesomeIcon icon={copied ? faClipboardCheck : faClipboard} /> {copied ? 'Link Copied to Clipboard' : 'Copy Shareable Link to Clipboard'}
                            </Button>
                        </CopyToClipboard>
                    )}
                </Row>
            </>
        )
    }

}

export default Message;