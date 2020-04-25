import React from 'react';
import { systemPreferences } from 'electron';
import { each, debounce } from 'lodash';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Row, Col } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faSignOutAlt, faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faDoorClosed, faCircle, faGrin, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { Janus } from 'janus-gateway';
import Pusher from 'pusher-js';

class Room extends React.Component {
    constructor(props) {
    
        super(props);

        this.state = {
            room: {},
            team: {},
            loading: true,
            members: [],
            local_stream: null,
            remote_streams: [],
            remote_videos: [],
            hasRemoteVideos: false,
            local_video: [],
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
            participant: false,
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

        this.renderVideo = this.renderVideo.bind(this);
        this.createDetachedWindowBound = this.createDetachedWindow.bind(this);

        this.toggleVideoOrAudio = this.toggleVideoOrAudio.bind(this);
        this.handleRemoteStream = this.handleRemoteStream.bind(this);
        this.updateDisplayedVideos = this.updateDisplayedVideos.bind(this);

        //this.updateDisplayedVideos = debounce(this.updateDisplayedVideos, 200);


    }

    async componentDidMount() {
        const { organization, teams, match, location, auth } = this.props;
        const { videoStatus, audioStatus, currentLoadingMessage } = this.state;

        var curTeam = {};
        var curRoom = {};
        var remote_streams = [];
        
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

        var room = curRoom;
        var team = curTeam;

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
        })

        this.setState({ local_stream });

        Janus.init({
            debug: true,
            dependencies: Janus.useDefaultDependencies(),
            callback: function() {
                    // Done!
            }
        });

        var presence_channel = this.pusher.subscribe(`presence-peers.${room.channel_id}`);

        var that = this;
        
        presence_channel.bind('pusher:subscription_succeeded', function(members) {

            let me = members.me;

            let local_video = [];

            if (me != {} && typeof local_stream !== 'undefined') {
                if (videoStatus) {
                    local_video.push(
                        <div key={me.id}>
                            <video autoPlay muted ref={that.renderVideo(local_stream)} style={{height:80 }} className="rounded shadow"></video>
                        </div>
                    )
                } 
            } 

            var remote_videos = [];
            var currentLoadingMessage = [];

            let rand = Math.floor(Math.random() * that.state.loadingMessages.length); 

            currentLoadingMessage.push(
                <div key={99999}>
                    <h1 className="text-center">It's just you here.</h1>
                    <h2 className="text-center h3">Other participants will appear here automatically after joining.</h2>
                    <h3 className="text-center h4">{that.state.loadingMessages[rand]}</h3>
                </div>
            );

            that.setState({ members: members.members, me, local_video, currentLoadingMessage });

            that.streamer = new Janus(
            {
                server: ['wss://streamer.watercooler.work:4443/', 'https://streamer.watercooler.work/streamer'],
                iceServers: [
                    { url: 'stun:global.stun.twilio.com:3478?transport=udp' },
                    { url: 'turn:global.turn.twilio.com:3478?transport=udp', username: me.info.nts_user, credential: me.info.nts_password},
                    { url: 'turn:global.turn.twilio.com:3478?transport=tcp', username: me.info.nts_user, credential: me.info.nts_password},
                    { url: 'turn:global.turn.twilio.com:443?transport=tcp', username: me.info.nts_user, credential: me.info.nts_password}
                ],
                success: function(handle) {
                    var { me } = that.state;

                    that.streamer.attach({
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
                            var { streamerHandle, local_stream } = that.state;
                            console.log(msg);
                            console.log(jsep);

                            if (jsep != null) {
                                streamerHandle.handleRemoteJsep({ "jsep": jsep });
                            }

                            if (msg.videoroom == "joined") {
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

                                        if (typeof msg.publishers != "undefined") {
                                            msg.publishers.forEach(publisher => {
                                                if (typeof remote_streams[publisher.display] == "undefined" 
                                                    || remote_streams[publisher.display].stopped == true
                                                ) {
                                                    //let's re-subscribe to this stream
                                                    that.handleRemoteStream(publisher.id, publisher.display);
                                                }
                                            })
                                        }
                                    }
                                })
                                
                            }

                            if (msg.videoroom == "event") {
                                //check if we have new publishers to subscribe to
                                if (typeof msg.publishers != "undefined") {
                                    msg.publishers.forEach(publisher => {
                                        if (typeof remote_streams[publisher.display] == "undefined" 
                                            || remote_streams[publisher.display].stopped == true
                                        ) {
                                            //let's re-subscribe to this stream
                                            that.handleRemoteStream(publisher.id, publisher.display);
                                        }
                                    })
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

                    that.setState({ connected: true, loading: false });

                },
                error: function(cause) {
                        // Error, can't go on...
                },
                destroyed: function() {
                        // I should get rid of this
                }
            });

        });

     

        this.setState({ room: curRoom, team: curTeam });

    }

    handleRemoteStream(remoteStreamId, remoteStreamDisplayId) {
        var { me, remote_streams, members, room, videoSizes } = this.state;

        var that = this;
        var curMember;
        var handle;

        each(members, function(member) {
            if (member.peer_uuid == remoteStreamDisplayId) {
               curMember = member; 
            }
        });

        this.streamer.attach({
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
                    "feed": remoteStreamId,
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
                var hasVideo = false;
                var hasAudio = false;
                tracks.forEach(track => {
                    console.log("TRACK");
                    console.log(track);
                    if (track.kind == "video" && track.enabled) {
                        hasVideo = true;
                    }
                    if (track.kind == "audio" && track.enabled) {
                        hasAudio = true;
                    }
                })

                remote_streams[curMember.id] = {
                    "stream_id": remoteStreamId,
                    "source": remote_stream,
                    "hasVideo": hasVideo,
                    "hasAudio": hasAudio,
                    "isMe": false,
                    "handle": handle,
                    "stopped": false,
                    "peer_uuid": remoteStreamDisplayId
                }

                that.setState({ remote_streams });

                that.updateDisplayedVideos(remote_streams);
            },
            oncleanup: function() {
                remote_streams.splice(curMember.id, 1);
                that.setState({ remote_streams });
                that.updateDisplayedVideos(remote_streams);
            },
            detached: function() {
                remote_streams.splice(curMember.id, 1);
                that.updateDisplayedVideos(remote_streams);
            }
        });
    }

    componentDidUpdate(prevProps, prevState) {

        var { dimensions } = this.props;

        if (prevProps.dimensions != dimensions) {
            this.updateDisplayedVideos(null, true);
        }

    }

    updateDisplayedVideos(remote_streams = null, dimensionsOnly = false) {
        var { videoSizes, remote_videos, room, team, hasRemoteVideos, currentLoadingMessage, members, containerBackgroundColors } = this.state;
        const { dimensions } = this.props;

        if (remote_streams == null) {
            var { remote_streams } = this.state;
        }

        let width = dimensions.width;
        width -= dimensions.sidebarWidth;
        let height = dimensions.height;

        var filteredStreams = remote_streams.filter(function (item) {
            return item !== undefined;
        });

        filteredStreams = filteredStreams.filter(function (item) {
            return item.stopped === false;
        });

        var currentKeys = [];
        filteredStreams.forEach(function (stream, key) {
            if (typeof currentKeys[key] != "undefined") return;

            currentKeys[key] = 1;
        })

        var remote_streams_count = filteredStreams.length;

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

            remote_videos = [];
            var that = this;


            each(filteredStreams, function(stream, key) {
                var curMember = null;
                each(members, function(member) {
                    if (member.peer_uuid == stream.peer_uuid) {
                        curMember = member;
                    }
                }) 
                if (stream.hasVideo) {
                    return remote_videos.push(
                        <div className="col p-0" key={key}>
                            <div className="mx-auto position-relative text-light"  style={{height: videoSizes.height, width: videoSizes.width }}>
                                <video autoPlay ref={that.renderVideo(stream.source)} className="rounded shadow" style={{height: videoSizes.height, width: videoSizes.width }}></video>
                                <div className="position-absolute overlay" style={{bottom:0,backgroundColor:"rgb(18, 20, 34, .5)",width:"100%"}}>
                                    <p className="pl-2 mb-1 mt-1 font-weight-bolder">{curMember.name}</p>
                                </div>
                            </div>
                        </div>
                    )
                }

                let rand = Math.floor(Math.random() * containerBackgroundColors.length); 

                remote_videos.push(
                    <div className="col p-0" key={key}>
                        <div className="rounded shadow mx-auto d-flex flex-column justify-content-center position-relative text-light" style={{height: videoSizes.height, width: videoSizes.width, backgroundColor:containerBackgroundColors[rand] }}>
                            <div className="mx-auto align-self-center">
                                <Image src={curMember.avatar} roundedCircle />
                                <p className="font-weight-bolder text-center" style={{paddingTop:5,fontSize:"1.5rem"}}><FontAwesomeIcon style={{color:"#f9426c"}} icon={faVideoSlash} /> Audio Only</p>
                            </div>
                            <div className="position-absolute overlay" style={{bottom:0,backgroundColor:"rgb(18, 20, 34, .5)",width:"100%"}}>
                                <p className="pl-2 mb-1 mt-1 font-weight-bolder">{curMember.name}</p>
                            </div>
                        </div>
                    </div>
                )
            });

            this.setState({ videoSizes, remote_videos, hasRemoteVideos: true });
             

        } else {

            if (!hasRemoteVideos) {
                //don't do anything
                return;
            }

            remote_videos = [];
            currentLoadingMessage = [];

            let rand = Math.floor(Math.random() * this.state.loadingMessages.length); 

            currentLoadingMessage.push(
                <div key={99999}>
                    <h1 className="text-center">It's just you here.</h1>
                    <h2 className="text-center h3">Other participants will appear here automatically after joining.</h2>
                    <h3 className="text-center h4">{this.state.loadingMessages[rand]}</h3>
                </div>
            );

            this.setState({ remote_videos, currentLoadingMessage, hasRemoteVideos: false });
        }
    }

    componentWillUnmount() {
        const { streams, me, room , streamerHandle, remote_streams, local_stream } = this.state;

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

        each(remote_streams, function(stream) {
            if (typeof stream != "undefined" && typeof stream.handle != "undefined") {
                var request = { 
                    "request":  "leave", 
                    "token": me.info.streamer_key
                }
        
                stream.handle.send({ "message": request });
                stream.handle.detach();
            }
        })

        if (typeof local_stream !== 'undefined') {
            const tracks = local_stream.getTracks();

            tracks.forEach(function(track) {
                track.stop();
            })
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
        const { streamerHandle, local_stream, me } = this.state;

        if (typeof local_stream !== 'undefined') {
            const tracks = local_stream.getTracks();

            var { videoStatus, audioStatus, local_video } = this.state;
            
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

            if (!videoStatus && local_video.length == 1) {
                local_video = [];
            } else if (videoStatus && local_video.length == 0) {
                local_video = [];
                local_video.push(
                    <div key={me.id}>
                        <video autoPlay muted ref={this.renderVideo(local_stream)} style={{height:80 }} className="rounded shadow"></video>
                    </div>
                )
            }

            this.setState({ videoStatus, audioStatus, local_video });
        }
    }

    render() {
        const { organization } = this.props;
        const { team, room, loading, remote_videos, local_video, connected, videoStatus, audioStatus, videoSizes, hasRemoteVideos, currentLoadingMessage } = this.state;

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
                    <Col xs={{span:8}}>
                        <div className="d-flex flex-row justify-content-end">
                            <div className="align-self-center pr-4">
                                <Button variant={audioStatus ? "light" : "danger"} className="mx-1" onClick={() => this.toggleVideoOrAudio("audio") }><FontAwesomeIcon icon={audioStatus ? faMicrophone : faMicrophoneSlash} /></Button>
                                <Button variant={videoStatus ? "light" : "danger"} className="mx-1" onClick={() => this.toggleVideoOrAudio("video") }><FontAwesomeIcon icon={videoStatus ? faVideo : faVideoSlash} /></Button>
                            </div>
                            {/*<Button variant="light" className="mx-1" onClick={() => this.createDetachedWindow() }><FontAwesomeIcon icon={faLayerGroup}></FontAwesomeIcon></Button>*/}
                            <div style={{width:106.66,height:80}} className="align-self-center">
                                {local_video.length == 0 ?
                                    <p style={{height:80,paddingTop:25,paddingLeft:2,fontWeight:"bolder",fontSize:"1.1rem"}}>Audio Only</p>
                                : 
                                    local_video
                                }
                            </div>
                        </div>
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
                                {hasRemoteVideos ?
                                    remote_videos
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
