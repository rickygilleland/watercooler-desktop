import React from 'react';
import { systemPreferences } from 'electron';
import update from 'immutability-helper';
import { each, debounce } from 'lodash';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Row, Col, TabContainer } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faSignOutAlt, faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faDoorClosed, faDoorOpen, faCircle, faGrin, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { Janus } from 'janus-gateway';
import Pusher from 'pusher-js';
import VideoList from './VideoList';

class Room extends React.Component {
    constructor(props) {
    
        super(props);

        this.state = {
            room: {},
            team: {},
            loading: true,
            members: [],
            local_stream: null,
            publishers: [],
            me: {},
            connected: false,
            leaving: false,
            videoSizes: {
                width: 0,
                height: 0,
                display: "row align-items-center justify-content-center h-100",
                containerHeight: window.innerHeight - 114
            },
            videoStatus: false,
            audioStatus: true,
            streamer_server_connected: false,
            streamerHandle: null,
            loadingMessages: [
                "Waiting for other members to join...",
                "Grab a cup of coffee while you wait.",
                "We're never gonna give you up, never gonna let you down, even if you're the only one here."
            ],
            currentLoadingMessage: [],
            containerBackgroundColors: [
                "#4381ff",
                "#4F4581",
                "#6936e3",
                "#e69a5a",
                "#205444",
                "#00DBD7"
            ]
        }

        this.pusher = new Pusher('3eb4f9d419966b6e1e0b', {
            forceTLS: true,
            cluster: 'mt1',
            authEndpoint: 'https://watercooler.work/broadcasting/auth',
            authTransport: "ajax",
            auth: {
                headers: {
                    Authorization: `Bearer ${this.props.auth.authKey}`,
                    Accept: 'application/json'
                }
            },
        });

        this.pusher.logToConsole = true;

        this.createDetachedWindowBound = this.createDetachedWindow.bind(this);

        this.toggleVideoOrAudio = this.toggleVideoOrAudio.bind(this);
        this.handleRemoteStreams = this.handleRemoteStreams.bind(this);
        this.updateDisplayedVideosSizes = this.updateDisplayedVideosSizes.bind(this);

        //this.updateDisplayedVideos = debounce(this.updateDisplayedVideos, 200);

        this.openMediaHandle = this.openMediaHandle.bind(this);
        this.renderVideo = this.renderVideo.bind(this);

    }

    componentDidMount() {
        const { teams, match, location } = this.props;

        var curTeam = {};
        var curRoom = {};
        
        if (typeof location.state != 'undefined' 
            && typeof location.state.room != 'undefined'
            && typeof location.state.team != 'undefined'
        ) {
            curRoom = location.state.room;
            curTeam = location.state.team;
        } else {
            //get the slug and pull it from the global state
            teams.forEach(function(team) {
                team.rooms.forEach(function(room) {
                    if (room.slug == match.params.roomSlug) {
                        curRoom = room;
                        curTeam = team; 
                    }
                });
            });
        }

        if (curRoom === {}) {
            push("/");
        }

        this.setState({ room: curRoom, team: curTeam });

        Janus.init({
            debug: true,
            dependencies: Janus.useDefaultDependencies(),
            callback: function() {
                    // Done!
            }
        });

        var presence_channel = this.pusher.subscribe(`presence-peers.${curRoom.channel_id}`);
        var that = this;
        
        presence_channel.bind('pusher:subscription_succeeded', function(members) {
            that.setState({ members: members.members, me: members.me });
            that.openMediaHandle();
        });

    }

    componentDidUpdate(prevProps, prevState) {
        const { dimensions } = this.props;
        const { publishers, local_stream } = this.state;

        if (prevProps.dimensions != dimensions || prevState.publishers.length != publishers.length) {
            this.updateDisplayedVideosSizes(null, true);
        }

        if ((prevState.publishers != publishers) && local_stream != null) {
            this.handleRemoteStreams();
        }
    }
    
    componentWillUnmount() {
        const { me, room , streamerHandle, publishers, local_stream } = this.state;

        if (typeof room.channel_id != 'undefined') {
            this.pusher.unsubscribe(`presence-peers.${room.channel_id}`);
        }

        this.pusher.disconnect();

        if (streamerHandle != null) {
            var request = { 
                "request":  "leave", 
                "token": me.info.streamer_key
            }
    
            streamerHandle.send({ "message": request });

            streamerHandle.detach();
        }

        publishers.forEach(publisher => {
            if (typeof publisher.handle != "undefined") {
                var request = {
                    "request": "leave",
                    "token": me.info.streamer_key
                }

                publisher.handle.send({ "message": request });
                publisher.handle.detatch();
            }
        })

        if (typeof local_stream !== 'undefined') {
            const tracks = local_stream.getTracks();

            tracks.forEach(function(track) {
                track.stop();
            })
        }
    }

    openMediaHandle() {
        var { me, room, team, local_stream } = this.state;
        var that = this;

        var rootStreamerHandle = new Janus(
        {
            server: ['wss://streamer.watercooler.work:4443/', 'https://streamer.watercooler.work/streamer'],
            iceServers: [
                { url: 'stun:global.stun.twilio.com:3478?transport=udp' },
                { url: 'turn:global.turn.twilio.com:3478?transport=udp', username: me.info.nts_user, credential: me.info.nts_password},
                { url: 'turn:global.turn.twilio.com:3478?transport=tcp', username: me.info.nts_user, credential: me.info.nts_password},
                { url: 'turn:global.turn.twilio.com:443?transport=tcp', username: me.info.nts_user, credential: me.info.nts_password}
            ],
            success: function(handle) {
                that.setState({ rootStreamerHandle });

                rootStreamerHandle.attach({
                    plugin: "janus.plugin.videoroom",
                    opaqueId: me.info.peer_uuid,
                    success: function(streamerHandle) {
                        that.setState({ streamerHandle });

                        //register a publisher
                        var request = { 
                            "request":  "join", 
                            "room": room.channel_id, 
                            "ptype": "publisher",
                            "display": me.info.peer_uuid,
                            "token": me.info.streamer_key
                        }

                        streamerHandle.send({ "message": request });
                    
                    },
                    error: function(cause) {
                            // Couldn't attach to the plugin
                    },
                    onmessage: function(msg, jsep) {
                        var { streamerHandle, currentLoadingMessage, containerBackgroundColors, members } = that.state;

                        console.log("ROOT MSG");
                        console.log(msg);
    
                        if (jsep != null) {
                            streamerHandle.handleRemoteJsep({ "jsep": jsep });
                        }

                        if (msg.videoroom == "joined") {
                            console.log("JOINED");
                            console.log(msg);

                            if (msg.publishers.length > 0) {
                                var publishers = msg.publishers;

                                let rand = Math.floor(Math.random() * containerBackgroundColors.length); 
                                
                                publishers.forEach(publisher => {
                                    each(members, function(member) {
                                        if (member.peer_uuid == publisher.display) {
                                            publisher.member = member;
                                        }
                                    }) 
                                    publisher.containerBackgroundColor = containerBackgroundColors[rand];

                                    if (typeof publisher.loading == "undefined") {
                                        publisher.loading = false;
                                    }
                                })

                                that.setState({ connected: true, loading: false, publishers });
                            } else {
                                currentLoadingMessage = [];

                                currentLoadingMessage.push(
                                    <div key={99999}>
                                        <h1 className="text-center">This room is empty.</h1>
                                        <h2 className="text-center h3">Participants will appear here automatically after joining.</h2>
                                    </div>
                                );

                                that.setState({ connected: true, loading: false, currentLoadingMessage }); 
                            }
                        }

                        if (msg.videoroom == "event") {
                            //check if we have new publishers to subscribe to
                            if (typeof msg.publishers != "undefined") {
                                let publishers = msg.publishers;

                                let rand = Math.floor(Math.random() * containerBackgroundColors.length); 

                                publishers.forEach(publisher => {
                                    each(members, function(member) {
                                        if (member.peer_uuid == publisher.display) {
                                            publisher.member = member;
                                        }
                                    }) 
                                    publisher.containerBackgroundColor = containerBackgroundColors[rand];

                                    if (typeof publisher.loading == "undefined") {
                                        publisher.loading = true;
                                    }
                                })

                                that.setState({ publishers: { ...publishers, ...that.state.publishers } });

                            }
                        }
                    },
                    oncleanup: function() {
                            // PeerConnection with the plugin closed, clean the UI
                            // The plugin handle is still valid so we can create a new one
                    },
                    detached: function() {
                            // Connection with the plugin closed, get rid of its features
                            // The plugin handle is not valid anymore
                    }
                })

            },
            error: function(cause) {
                    // Error, can't go on...
            },
            destroyed: function() {
                    // I should get rid of this
            }
        });

    }

    async startPublishingStream() {
        var  { streamerHandle, audioStatus, videoStatus } = this.state;
        let streamOptions;
        /* TODO: Manually prompt for camera and microphone access on macos to handle it more gracefully - systemPreferences.getMediaAccessStatus(mediaType) */
        streamOptions = {
            video: {
                aspectRatio: 1.3333333333
            },
            audio: true
        }

        const local_stream = await navigator.mediaDevices.getUserMedia(streamOptions);

        const tracks = local_stream.getTracks();

        tracks.forEach(function(track) {
            if (track.kind == "video") {
                track.enabled = videoStatus;
            } else {
                track.enabled = audioStatus;
            }
        });

        this.setState({ local_stream });

        var that = this;

        //publish our feed
        streamerHandle.createOffer({
            stream: local_stream,
            success: function(jsep) {
                var request = {
                    "request": "publish",
                    "audio": audioStatus,
                    "video": videoStatus,
                    "data": true,
                    "videocodec": "vp9"
                }

                streamerHandle.send({ "message": request, "jsep": jsep });

                that.handleRemoteStreams();
            }
        })
    }

    handleRemoteStreams() {
        var { me, publishers, room, rootStreamerHandle } = this.state;

        var that = this;
        var curMember;
        var handle;

        publishers.forEach((publisher, key) => {

            publishers[key] = {
                loading: true,
                ...publisher
            }

            that.setState({ publishers })

            rootStreamerHandle.attach({
                plugin: "janus.plugin.videoroom",
                opaqueId: me.info.peer_uuid,
                success: function(remoteHandle) {
    
                    handle = remoteHandle;
    
                    //subscribe to the feed
                    var request = { 
                        "request":  "join", 
                        "room": room.channel_id, 
                        "ptype": "subscriber",
                        "display": me.info.peer_uuid,
                        "token": me.info.streamer_key,
                        "feed": publisher.id,
                    }

                    remoteHandle.send({ "message": request });
    
                },
                error: function(cause) {
                        // Couldn't attach to the plugin
                },
                onmessage: function(msg, jsep) {
                    console.log("REMOTE MSG");
                    console.log(msg);
                    if (jsep != null) {
                        if (typeof msg.display != "undefined") {
                            handle.createAnswer({
                                jsep: jsep,
                                media: { audioSend: false, videoSend: false},
                                success: function(jsep) {
                                    var request = {
                                        "request": "start",
                                        "room": msg.room
                                    }
    
                                    handle.send({ "message": request, "jsep": jsep });
                                }
                            })
                        }
                    }
                },
                onremotestream: function(remote_stream) {
                    var tracks = remote_stream.getTracks();
                    console.log(remote_stream);
                    console.log(tracks);
                    var hasVideo = false;
                    var hasAudio = false;
                    tracks.forEach(track => {
                        if (track.kind == "video" && track.enabled) {
                            hasVideo = true;
                        }
                        if (track.kind == "audio" && track.enabled) {
                            hasAudio = true;
                        }
                    })

                    publishers[key] = {
                        stream: remote_stream,
                        hasVideo,
                        hasAudio,
                        handle,
                        ...publisher
                    }

                    that.setState({ publishers });

                },
                oncleanup: function() {

                    delete publishers[key].stream;
                    publishers[key].hasVideo = false;
                    publishers[key].hasAudio = false;

                    that.setState({ publishers });
                },
                detached: function() {
                    delete publishers[key].stream;
                    publishers[key].hasVideo = false;
                    publishers[key].hasAudio = false;
                    
                    that.setState({ publishers });
                }
            });
        })
    }

    updateDisplayedVideosSizes() {
        var { videoSizes, publishers} = this.state;
        const { dimensions } = this.props;

        if (remote_streams == null) {
            var { remote_streams } = this.state;
        }

        let width = dimensions.width;
        width -= dimensions.sidebarWidth;
        let height = dimensions.height;

        var remote_streams_count = publishers.length;

        width -= 80;
    
        if (remote_streams_count > 0) {
             //re-calculate the video height/width

            if (remote_streams_count == 2) {
                width /= 2;
            }

            if (dimensions.width > 620) {    
                if (remote_streams_count > 2 && remote_streams_count <= 6) {
                    width /= 3;
                }
            } else {    
                if (remote_streams_count > 2 && remote_streams_count <= 6) {
                    width /= 4;
                }
            }

            if (remote_streams_count > 6 && remote_streams_count <= 9) {
                //3x3
                width = width / 3;
            }

            if (remote_streams_count > 9 && remote_streams_count <= 12) {
                //4x4
                width = width / 4;
            }

            var aspectRatio = 4 / 3;

            height = Math.round( width / aspectRatio );

            var i=1;
            while(height > (dimensions.height - 200)) {
                width = width - i;
                height = Math.round( width / aspectRatio );
                i += 10
            }
            
            var display = "row align-items-center justify-content-center h-100";

            if (dimensions.width < 620) {
                display = "row align-items-center justify-content-center flex-column h-100";
            }

            videoSizes = {
                height: height,
                width: width,
                display: display,
                containerHeight: dimensions.height - 80
            }

            this.setState({ videoSizes });
            
        } 
    }

    renderVideo(source) {
        return(
            video => {
                if (video != null) { video.srcObject = source }
            }
        )
    }

    createDetachedWindow() {

    }

    toggleVideoOrAudio(type) {
        var { streamerHandle, local_stream, videoStatus, audioStatus } = this.state;

        if (typeof local_stream !== 'undefined') {
            const tracks = local_stream.getTracks();
            
            tracks.forEach(function(track) {
                if (track.kind == type) {
                    track.enabled = track.enabled ? false : true;

                    if (type == "video") {
                        videoStatus = track.enabled ? true : false;
                    } else {
                        audioStatus = track.enabled ? true : false;
                    }
                }
            })

            if (streamerHandle != null) {
                //update our published stream
                var request = {
                    "request": "configure",
                    "audio": audioStatus,
                    "video": videoStatus,
                    "videocodec": "vp9"
                }

                streamerHandle.send({ "message": request });
            }

            this.setState({ videoStatus, audioStatus });
        }
    }

    render() {
        const { room, loading, publishers, local_stream, videoStatus, audioStatus, videoSizes, currentLoadingMessage } = this.state;

        return (
            <React.Fragment>
                <Row className="text-light pl-0 ml-0" style={{height:80,backgroundColor:"#121422"}}>
                    <Col xs={{span:4}}>
                        <div className="d-flex flex-row justify-content-start">
                            <div className="align-self-center">
                                <h5 style={{fontWeight:"bolder"}}># {room.name}</h5>
                            </div>
                            <div style={{height:80}}></div>
                        </div>
                    </Col>
                    <Col xs={{span:4}}>
                        <div className="d-flex flex-row justify-content-center">
                            <div className="align-self-center pr-4">
                                {local_stream === null ?
                                    <Button variant="success" className="mx-1" onClick={() => this.startPublishingStream() }><FontAwesomeIcon icon={faDoorOpen} /> Join Room</Button>
                                :
                                    <Button variant="danger" className="mx-1" onClick={() => this.stopPublishingStream() }><FontAwesomeIcon icon={faDoorClosed} /> Leave Room</Button>
                                }
                            </div>
                            <div style={{height:80}}></div>
                        </div>
                    </Col>
                    <Col xs={{span:4}}>
                        {local_stream ?
                            <div className="d-flex flex-row justify-content-end">
                                <div className="align-self-center pr-4">
                                    <Button variant={audioStatus ? "light" : "danger"} className="mx-1" onClick={() => this.toggleVideoOrAudio("audio") }><FontAwesomeIcon icon={audioStatus ? faMicrophone : faMicrophoneSlash} /></Button>
                                    <Button variant={videoStatus ? "light" : "danger"} className="mx-1" onClick={() => this.toggleVideoOrAudio("video") }><FontAwesomeIcon icon={videoStatus ? faVideo : faVideoSlash} /></Button>
                                </div>
                                {/*<Button variant="light" className="mx-1" onClick={() => this.createDetachedWindow() }><FontAwesomeIcon icon={faLayerGroup}></FontAwesomeIcon></Button>*/}
                                <div style={{width:106.66,height:80}} className="align-self-center">
                                    {!videoStatus ?
                                        <p style={{height:80,paddingTop:25,paddingLeft:2,fontWeight:"bolder",fontSize:"1.1rem"}}>Audio Only</p>
                                    : 
                                        <video autoPlay muted ref={this.renderVideo(local_stream)} style={{height:80 }} className="rounded shadow"></video>
                                    }
                                </div>
                            </div>
                        : '' }
                    </Col>
                </Row>
                <Container className="ml-0" fluid style={{height:videoSizes.containerHeight}}>
                    {loading ? 
                        <React.Fragment>
                            <h1 className="text-center mt-5">Loading...</h1>
                            <center><FontAwesomeIcon icon={faCircleNotch} className="mt-3" style={{fontSize:"2.4rem",color:"#6772ef"}} spin /></center> 
                        </React.Fragment>  
                    : 
                        <React.Fragment>
                            <div className={videoSizes.display}>
                                {publishers.length > 0 ?
                                    <VideoList
                                        videoSizes={videoSizes}
                                        publishers={publishers}
                                        renderVideo={this.renderVideo}
                                    ></VideoList>
                                :
                                    currentLoadingMessage
                                }
                            </div>
                        </React.Fragment>
                    }
                </Container>
            </React.Fragment>
        );
    }
}

export default Room;
