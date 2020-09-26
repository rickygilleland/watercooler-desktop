import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { Container, Image, Button, Card, CardColumns, Navbar, Row, Col, OverlayTrigger, Overlay, Popover, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faUserPlus, faCircle, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import SendMessage from './SendMessage';
import MessageMediaPlayer from './MessageMediaPlayer';

import posthog from 'posthog-js';

class Library extends React.Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        const { getLibraryItems } = this.props;

        getLibraryItems();
    }

    componentDidUpdate() {
    }

    render() {
        const { libraryLoading, libraryItemCreating, createItem, settings, user, libraryItems } = this.props;

        var libraryItemsKeys = Object.keys(libraryItems);

        return(
            <div className="d-flex flex-column" style={{height: process.env.REACT_APP_PLATFORM === "web" ? 'calc(100vh - 30px)' : 'calc(100vh - 22px)'}}>
                <Row className="pl-0 ml-0" style={{height:80}}>
                    <Col xs={{span:4}}>
                        <div className="d-flex flex-row justify-content-start">
                            <div className="align-self-center">
                                <p style={{fontWeight:"bolder",fontSize:"1.65rem"}} className="pb-0 mb-0">
                                    Library
                                    {libraryLoading && (
                                        <FontAwesomeIcon icon={faCircleNotch} style={{color:"#6772ef",marginLeft:10,marginTop:-2,verticalAlign:'middle',fontSize:".8rem"}} spin />
                                    )}
                                </p>
                            </div>
                            <div style={{height:80}}></div>
                        </div>
                    </Col>
                    <Col xs={{span:4,offset:4}}>
                    </Col>
                </Row>
                <Container style={{overflowY:"scroll"}} fluid>
                    {libraryLoading && libraryItemsKeys.length == 0 && (
                        <div style={{marginTop: "4rem"}}>
                            <Row className="mt-3 mb-4">
                                <Col xs={{span:12}} className="text-center">
                                    <h1>Loading Library...</h1>
                                    <FontAwesomeIcon icon={faCircleNotch} className="mt-3 mx-auto" style={{fontSize:"2.4rem",color:"#6772ef"}} spin />
                                </Col>
                            </Row>
                        </div>
                    )}
                    {!libraryLoading && libraryItemsKeys.length == 0 && (
                        <div style={{marginTop: "4rem"}}>
                            <Row className="mt-3 mb-4">
                                <Col xs={{span:12}} className="text-center">
                                    <h1>Your library is empty.</h1>
                                    <p>Record your first audio or video Blab now and we'll store here for later.</p>
                                </Col>
                            </Row>
                        </div>
                    )}
                    {libraryItemsKeys.length > 0 && (
                        <Row>
                            {libraryItemsKeys.map((itemId, key) => {
                                let item = libraryItems[itemId];

                                if (item == null || typeof item == "undefined") {
                                    return null;
                                }

                                let date = DateTime.fromISO(item.created_at)
                                var formattedDate = date.toRelativeCalendar();

                                if (DateTime.local().minus({days: 7}) > date) {
                                    formattedDate = date.toLocaleString(DateTime.DATE_FULL)
                                }

                                return (
                                    <Col xs={{span:12}} md={{span:6}} xl={{span:4}} className="d-flex align-items-stretch" key={item.id}>
                                        <Card className="w-100 m-2 shadow-sm">
                                            <Card.Body>
                                                {item.attachments.length > 0 && item.attachments[0].processed == true && (
                                                    <div className="mt-3">
                                                        <MessageMediaPlayer
                                                            autoplay={false}
                                                            controls={true}
                                                            source={item.attachments[0].temporary_url}
                                                            mediaType={item.attachments[0].mime_type}
                                                            thumbnail={item.attachments[0].thumbnail_url}
                                                            id={`video_player_${item.id}`}
                                                        />
                                                    </div>
                                                )}
                                                {item.attachments[0].processed == false && (
                                                    <p style={{paddingTop:15,fontWeight:700,marginBottom:0}}>Video Processing <FontAwesomeIcon icon={faCircleNotch} style={{color:"#6772ef"}} spin /><br /><small>The video will appear here automatically shortly...</small></p>
                                                )}
                                                <Row style={{marginLeft: 0}}> 
                                                    <p style={{paddingLeft: item.attachments[0].processed == true ? 5 : 0,marginTop:5}}>
                                                        <span className="text-muted" style={{fontSize:".75rem",textTransform:"capitalize"}}>
                                                            {formattedDate}
                                                        </span>
                                                    </p>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                )
                            })}
                        </Row>
                    )}
                </Container>
                <div className="mt-auto">
                    <SendMessage 
                        settings={settings} 
                        user={user} 
                        isLibrary={true}
                        createItem={createItem}
                        libraryItemCreating={libraryItemCreating}
                    />
                </div>
            </div>
        )
    }

}

export default Library;
