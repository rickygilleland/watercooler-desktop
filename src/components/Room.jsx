import React from 'react';
import { systemPreferences } from 'electron';
import { each, debounce } from 'lodash';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Navbar, Row } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faSignOutAlt, faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faDoorClosed, faCircle, faGrin, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { Janus } from 'janus-gateway';
import Pusher from 'pusher-js';
import Peer from 'peerjs';

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
            local_video: [],
            me: {},
            connected: false,
            leaving: false,
            dimensions: {
                width: 0,
                height: 0
            },
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




        this.renderVideoBound = this.renderVideo.bind(this);
        this.createDetachedWindowBound = this.createDetachedWindow.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.toggleVideoOrAudio = this.toggleVideoOrAudio.bind(this);
        this.handleRemoteStream = this.handleRemoteStream.bind(this);
        this.updateDisplayedVideos = this.updateDisplayedVideos.bind(this);

        this.updateDisplayedVideos = debounce(this.updateDisplayedVideos, 200);


    }

    async componentDidMount() {
        const { organization, teams, match, location, auth } = this.props;
        const { videoStatus, audioStatus } = this.state;

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

        this.handleResize();
        window.addEventListener('resize', this.handleResize);

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
                        <div style={{position:"absolute",right:0,bottom:50}} key={me.id}>
                            <video autoPlay muted ref={
                                video => {
                                    if (video != null) { video.srcObject = local_stream }
                                }
                            } style={{height:80 }} className="rounded shadow"></video>
                        </div>
                    )
                } 
            } 

            var remote_videos = [];

            remote_videos.push(
                <div key={99999}>
                    <h1 className="text-center">You are the only one in {team.name} / {room.name}.</h1>
                    <h2 className="text-center">Waiting for other members to join...</h2>
                </div>
            );

            that.setState({ members, me, local_video, remote_videos });

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

        each(members.members, function(member) {
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
                remote_streams[curMember.id] = {
                    "stream_id": remoteStreamId,
                    "source": remote_stream,
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

        var { dimensions } = this.state;

        if (prevState.dimensions != dimensions) {
            this.updateDisplayedVideos();
        }

    }

    updateDisplayedVideos(remote_streams = null) {
        var { videoSizes, remote_videos, dimensions, room, team } = this.state;

        if (remote_streams == null) {
            var { remote_streams } = this.state;
        }

        let width = dimensions.width;
        let height = dimensions.height;

        var filteredStreams = remote_streams.filter(function (item) {
            return item !== undefined;
        });

        filteredStreams = filteredStreams.filter(function (item) {
            return item.stopped === false;
        });

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
                containerHeight: dimensions.height - 104
            }

            remote_videos = [];

            each(remote_streams, function(stream, key) {
                if (typeof stream !== "undefined" && typeof stream.source !== "undefined" && stream.stopped === false) {
                    remote_videos.push(
                        <div className="col p-0" key={key}>
                            {/* refactor later because inline function will get called twice, once with null */}
                            <center><video autoPlay ref={
                                video => {
                                    if (video != null) { video.srcObject = stream.source }
                                }
                            } className="rounded shadow" style={{height: videoSizes.height, width: videoSizes.width }}></video></center>
             
                        </div>
                    )
                }
            });

            this.setState({ videoSizes, remote_videos });

        } else {

            remote_videos = [];

            remote_videos.push(
                <div key={99999}>
                    <h1 className="text-center">You are the only one in {team.name} / {room.name}.</h1>
                    <h2 className="text-center">Waiting for other members to join...</h2>
                </div>
            );

            this.setState({ remote_videos });
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

        window.removeEventListener('resize', this.handleResize);
    }

    renderVideo() {
        
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
                    <div style={{position:"absolute",right:0,bottom:50}} key={me.id}>
                        <video autoPlay muted ref={
                            video => {
                                if (video != null) { video.srcObject = local_stream }
                            }
                        } style={{height:80 }} className="rounded shadow"></video>
                    </div>
                )
            }

            this.setState({ videoStatus, audioStatus, local_video });
        }
    }

    handleResize() {
        this.setState({ dimensions: { width: window.innerWidth, height: window.innerHeight } });
    }

    render() {
        const { organization } = this.props;
        const { team, room, loading, remote_videos, local_video, connected, videoStatus, audioStatus, videoSizes } = this.state;

        return (
            <React.Fragment>
                <Navbar bg="dark" className="text-light pt-3" expand="lg">
                    <Navbar.Brand>
                        <p className="text-light p-0 m-0"><strong>{team.name} / {room.name}</strong></p>
                    </Navbar.Brand>
                    <div className="ml-auto">
                        {connected ?
                            <p><FontAwesomeIcon icon={faCircle} className="mr-2" style={{color:"green",fontSize:8,verticalAlign:"middle"}} />Connected</p>
                            :
                            <p><FontAwesomeIcon icon={faCircle} className="mr-2" style={{color:"red",fontSize:8,verticalAlign:"middle"}} />Connecting...</p>
                        }
                    </div>
                </Navbar>
                <Container fluid style={{height:videoSizes.containerHeight}}>
                    {loading ? 
                        <React.Fragment>
                            <h1 className="text-center mt-5">Loading...</h1>
                            <center><FontAwesomeIcon icon={faCircleNotch} className="mt-3" style={{fontSize:"2.4rem",color:"#6772ef"}} spin /></center> 
                        </React.Fragment>  
                    : 
                        <React.Fragment>
                            <div className={videoSizes.display}>
                                {remote_videos}
                            </div>
                            {local_video}
                        </React.Fragment>
                    }
                </Container>

                <div className="fixed-bottom bg-dark py-2">
                    <Row className="justify-content-center">
                        <Button variant={audioStatus ? "light" : "danger"} className="mx-1" onClick={() => this.toggleVideoOrAudio("audio") }><FontAwesomeIcon icon={audioStatus ? faMicrophone : faMicrophoneSlash} /></Button>
                        <Button variant={videoStatus ? "light" : "danger"} className="mx-1" onClick={() => this.toggleVideoOrAudio("video") }><FontAwesomeIcon icon={videoStatus ? faVideo : faVideoSlash} /></Button>
                        {/*<Button variant="light" className="mx-1" onClick={() => this.createDetachedWindow() }><FontAwesomeIcon icon={faLayerGroup}></FontAwesomeIcon></Button>*/}
                        <Link to={{
                            pathname: `/`
                        }}>
                            <Button variant="danger" className="mx-1"><FontAwesomeIcon icon={faDoorClosed} className="mr-2" />Leave</Button>
                        </Link>
                    </Row>
                </div>
            </React.Fragment>
        );
    }
}

export default Room;
