import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { Container, Image, Button, Card, CardColumns, Navbar, Row, Col, OverlayTrigger, Overlay, Popover, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import SendMessage from './SendMessage';
import Message from './Message';
import videojs from 'video.js'
import posthog from 'posthog-js';

class MessageThread extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            thread: {},
            messages: [],
            recipients: [],
            recipientName: null
        };

        this.initializeThread = this.initializeThread.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    componentDidMount() {
        this.initializeThread();
    }

    componentDidUpdate(prevProps, prevState) {
        const { match, push, publicThreads, privateThreads, sharedThreads } = this.props;
        const { thread, messages } = this.state;

        if (prevProps.match != match && match.params.threadSlug != thread.slug || Object.keys(thread).length === 0) {
            this.initializeThread();
            this.scrollToBottom();
        }

        var prevThreadToCompare;
        var threadToCompare;

        if (match.params.type == "private") {
            prevThreadToCompare = prevProps.privateThreads;
            threadToCompare = privateThreads;
        }

        if (match.params.type == "public") {
            prevThreadToCompare = prevProps.publicThreads;
            threadToCompare = publicThreads;
        }

        if (match.params.type == "shared") {
            prevThreadToCompare = prevProps.sharedThreads;
            threadToCompare = sharedThreads;
        }

        if (prevThreadToCompare != threadToCompare) {
            threadToCompare.forEach(propThread => {
                if (propThread.id == thread.id && typeof propThread.messages != "undefined" && propThread.messages != messages) {
                    this.setState({ messages: propThread.messages });
                }
            })
        }

        if (messages.length != prevState.messages.length) {
            this.scrollToBottom();
        }
    }

    initializeThread() {
        const { match, push, publicThreads, privateThreads, sharedThreads, getThreadMessages } = this.props;

        var curThread = null;
        var threadsToCheck;

        if (match.params.type == "private") {
            threadsToCheck = privateThreads;
        }

        if (match.params.type == "public") {
            threadsToCheck = publicThreads;
        }

        if (match.params.type == "shared") {
            threadsToCheck = sharedThreads;
        }

        threadsToCheck.forEach(thread => {
            if (thread.slug == match.params.threadSlug) {
                curThread = thread;
            }
        })

        if (curThread != null) {
            getThreadMessages(curThread.id);
            
            var recipients = [];
            curThread.users.forEach(threadUser => {
                recipients.push(threadUser.id);
            })

            let messages = [];

            if (typeof curThread.messages != "undefined") {
                messages = curThread.messages;
            }

            this.setState({ thread: curThread, messages, recipients });
        }

        this.scrollToBottom();
    }

    componentWillUnmount() {
    }

    scrollToBottom() {
        if (typeof this.messagesContainer != "undefined") {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    render() {
        const { threadLoading, settings, user, createMessage, organization, messageLoading, messageCreatedStateChange } = this.props;
        const { thread, messages, recipients, recipientName } = this.state;

        return (
            <div className="d-flex flex-column" style={{height: process.env.REACT_APP_PLATFORM === "web" ? 'calc(100vh - 30px)' : 'calc(100vh - 22px)'}}>
                <Row className="pl-0 ml-0 border-bottom" style={{height:80}}>
                    <Col xs={{span:4}}>
                        <div className="d-flex flex-row justify-content-start">
                            <div className="align-self-center">
                                <p style={{fontWeight:"bolder",fontSize:"1.65rem"}} className="pb-0 mb-0">{thread.name}</p>
                            </div>
                            <div style={{height:80}}></div>
                        </div>
                    </Col>
                    <Col xs={{span:4,offset:4}}>
                    </Col>
                </Row>
                {threadLoading && messages.length == 0 && (
                    <div style={{marginTop: "4rem"}}>
                        <Row className="mt-3 mb-4">
                            <Col xs={{span:12}} className="text-center">
                                <h1>Loading Messages...</h1>
                                <FontAwesomeIcon icon={faCircleNotch} className="mt-3 mx-auto" style={{fontSize:"2.4rem",color:"#6772ef"}} spin />
                            </Col>
                        </Row>
                    </div>
                )}
                <Container style={{overflowY:"scroll"}} className="mt-auto" ref={(el) => { this.messagesContainer = el; }} fluid>
                    {messages.length > 0 && (
                        messages.map((message, key) => {
                            const localDate = DateTime.local();
                            let curDate = DateTime.fromISO(message.created_at);
                            let renderDateHeading = true;

                            const renderYearWithDate = curDate.startOf('year') < localDate.startOf('year');

                            if (key > 0) {
                                let prevDate = DateTime.fromISO(messages[key - 1].created_at);
                                renderDateHeading = prevDate.startOf('day') < curDate.startOf('day');
                            }

                            const renderHeading = key == 0 || key > 0 && message.user_id == messages[key - 1].user_id;
                            
                            return(
                                <div key={key}>
                                    {renderDateHeading && (
                                        <p className="text-center mt-2" style={{fontWeight:700}}>
                                            {renderYearWithDate ? curDate.toLocaleString(DateTime.DATE_HUGE) : curDate.toFormat('EEEE, MMMM, d')}    
                                        </p>
                                    )}
                                    <Message
                                        message={message}
                                        renderHeading={renderHeading}
                                    />
                                </div>
                            )
                        })
                    )}
                    {!threadLoading && messages.length == 0 && (
                        <p className="text-center mx-auto" style={{fontSize:"1.5rem",fontWeight:700,marginTop:"4rem"}}>You don't have any message history with this person yet.</p>
                    )}
                </Container>
                <SendMessage 
                    settings={settings} 
                    user={user} 
                    expanded={false}
                    recipients={recipients} 
                    recipientName={recipientName}
                    createMessage={createMessage} 
                    organization={organization} 
                    messageLoading={messageLoading}
                    messageCreatedStateChange={() => this.setState({ messageCreated: true })}
                    messageOpened={() => this.scrollToBottom()}
                />
            </div>
        )
    }

}

export default MessageThread;