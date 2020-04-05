import React from 'react';
import { systemPreferences } from 'electron';
import { each } from 'lodash';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Navbar, Row } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faSignOutAlt, faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faDoorClosed, faCircle } from '@fortawesome/free-solid-svg-icons';
import routes from '../constants/routes.json';
import Echo from "laravel-echo";
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
                height: 0
            },
            videoStatus: "light",
            audioStatus: "light",
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
    }

    async componentDidMount() {
        const { organization, teams, match, location, auth } = this.props;

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

        /* TODO: Manually prompt for camera and microphone access on macos to handle it more gracefully - systemPreferences.getMediaAccessStatus(mediaType) */

        const local_stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 1280,
                height: 720,
                frameRate: {
                    ideal: 24
                }
            },
            audio: true
        });

        this.local_stream = local_stream;

        var presence_channel = this.pusher.subscribe(`presence-peers.${room.channel_id}`);

        var that = this;
        
        presence_channel.bind('pusher:subscription_succeeded', function(members) {

            let me = members.me;

            let local_video = [];

            if (me != {} && typeof that.local_stream !== 'undefined') {
                local_video.push(
                    <div style={{position:"absolute",right:0,bottom:50}} key={me.id}>
                        <video autoPlay muted ref={
                            video => {
                                if (video != null) { video.srcObject = that.local_stream }
                            }
                        } style={{height:80}} className="rounded shadow"></video>
                    </div>
                )
            } 

            that.setState({ members, me, local_video });

                that.peer = new Peer(members.me.info.peer_uuid, {
                    host: "peer.watercooler.work",
                    port: 443,
                    secure: true,
                    path: "/peer",
                    config: {'iceServers': [
                        { url: 'stun:global.stun.twilio.com:3478?transport=udp' },
                        { url: 'turn:global.turn.twilio.com:3478?transport=udp', username: me.info.nts_user, credential: me.info.nts_password},
                        { url: 'turn:global.turn.twilio.com:3478?transport=tcp', username: me.info.nts_user, credential: me.info.nts_password},
                        { url: 'turn:global.turn.twilio.com:443?transport=tcp', username: me.info.nts_user, credential: me.info.nts_password}
                    ]}
                });

                let peer = that.peer;

                peer.on('open', function(id) {

                    that.setState({ connected: true, loading: false });

                    let local_stream = that.local_stream;

                    var me = members.me;

                    each(members.members, function(member) {
                        if (member.id != me.id) {
        
                            var call = peer.call(member.peer_uuid, local_stream);
        
                            call.on('stream', function(member_stream) {
                                
                                remote_streams[member.id] = {
                                    id: member.id,
                                    name: member.name,
                                    source: member_stream,
                                    isMe: false,
                                    call: call,
                                    peer_uuid: member.peer_uuid,
                                    stopped: false
                                }

                                that.setState({remote_streams: remote_streams, loading: false });
                                
                                
                            });
                            
                        }
                    });
                    
                });

                peer.on('call', function(call) {

                    call.answer(that.local_stream);

                    call.on('stream', function(member_stream) {
                        //save their stream to state
                        each(members.members, function(member) {
                            if (member.peer_uuid == call.peer) {
                                if (typeof remote_streams[member.id] == "undefined") {
                                    remote_streams[member.id] = {};
                                }
                                remote_streams[member.id].source = member_stream;
                                remote_streams[member.id].isMe = false;
                                remote_streams[member.id].call = call;
                                remote_streams[member.id].stopped = false;
                                remote_streams[member.id].peer_uuid = call.peer; 
                            }
                        });

                        that.setState({remote_streams: remote_streams, loading: false });

                    });
                });

                peer.on('error', function(error) {
                    console.log("ERROR");
                    console.log(error);
                    console.log(error.type);
                });
        
     
        });

        presence_channel.bind('pusher:member_removed', function(member) {

            if (typeof remote_streams[member.id] !== "undefined" && typeof remote_streams[member.id].source !== "undefined") {
                remote_streams[member.id].source = null;
                remote_streams[member.id].isMe = false;
                remote_streams[member.id].call = null;
                remote_streams[member.id].stopped = true;

                that.setState({ remote_streams: remote_streams });
            }

        });

        this.setState({ room: curRoom, team: curTeam });

    }

    componentDidUpdate(prevProps, prevState) {

        const { videoSizes } = this.state;

        let width = this.state.dimensions.width;
        let height = this.state.dimensions.height;

        if (prevState.remote_streams.length != this.state.remote_streams.length || prevState.dimensions != this.state.dimensions) {
            var filteredStreams = this.state.remote_streams.filter(function (item) {
                return item !== undefined;
            });

            var remote_streams_count = filteredStreams.length;

            width -= 80;
           
            if (remote_streams_count > 0) {
                 //re-calculate the video height/width

                if (remote_streams_count == 2) {
                    width /= 2;
                }


                if (width > 620) {    
                    if (remote_streams_count > 2 && remote_streams_count <= 6) {
                        width /= 3;
                    }
                } else {    
                    if (remote_streams_count > 2 && remote_streams_count <= 6) {
                        width /= 2;
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

                let aspectRatio = 1280 / 720;

                height = Math.round( width / aspectRatio );

                this.setState({ videoSizes: { height: height, width: width }});
            }
        }

        if (prevState.remote_streams != this.state.remote_streams || prevState.videoSizes != this.state.videoSizes) {
            let updated_remote_videos = [];
            each(this.state.remote_streams, function(stream) {
                if (typeof stream !== "undefined" && typeof stream.source !== "undefined" && stream.stopped === false) {
                    updated_remote_videos.push(
                        <div className="col p-0" key={stream.id}>
                            {/* refactor later because inline function will get called twice, once with null */}
                            <video autoPlay ref={
                                video => {
                                    if (video != null) { video.srcObject = stream.source }
                                }
                            } className="rounded shadow" style={{height: videoSizes.height, width: videoSizes.width }}></video>
                        </div>
                    )
                }
            });
            
            this.setState({ remote_videos: updated_remote_videos });
        }

    }

    componentWillUnmount() {
        const { streams, me, room } = this.state;

        if (typeof room.channel_id != 'undefined') {
            this.pusher.unsubscribe(`presence-peers.${room.channel_id}`);
        }

        this.pusher.disconnect();

        if (typeof this.peer !== 'undefined') {
            this.peer.destroy();
        }

        if (typeof this.local_stream !== 'undefined') {
            const tracks = this.local_stream.getTracks();

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
        if (typeof this.local_stream !== 'undefined') {
            const tracks = this.local_stream.getTracks();

            var { videoStatus, audioStatus } = this.state;
            
            tracks.forEach(function(track) {
                if (track.kind == type) {
                    track.enabled = track.enabled ? false : true;

                    if (type == "video") {
                        videoStatus = track.enabled ? "light" : "danger";
                    } else {
                        audioStatus = track.enabled ? "light" : "danger";
                    }
                }
            })

            this.setState({ videoStatus, audioStatus });
        }
    }

    handleResize() {
        this.setState({ dimensions: { width: window.innerWidth, height: window.innerHeight } });
    }

    render() {
        const { organization } = this.props;
        const { team, room, loading, remote_videos, local_video, connected, videoStatus, audioStatus } = this.state;
       
        return (
            <React.Fragment>
                <Navbar bg="dark" className="text-light pt-3" expand="lg">
                    <Navbar.Brand>
                        <p className="text-light p-0 m-0"><strong>{team.name} / {room.name}</strong></p>
                    </Navbar.Brand>
                    <div className="ml-auto">
                        {connected ?
                            <p><span style={{color:"green"}}>•</span> Connected</p>
                            :
                            <p><span style={{color:"red"}}>•</span> Connecting...</p>
                        }
                    </div>
                </Navbar>

                {loading ? 
                    <React.Fragment>
                        <h1 className="text-center mt-5">Loading...</h1>
                        <center><FontAwesomeIcon icon={faCircleNotch} className="mt-3" style={{fontSize:"2.4rem",color:"#6772ef"}} spin /></center> 
                    </React.Fragment>  
                : 
                    <React.Fragment>
                        <div className="row align-items-center justify-content-center">
                            <center>
                                {remote_videos}
                            </center>
                        </div>
                        {local_video}
                    </React.Fragment>
                }

                <div className="fixed-bottom bg-dark py-2">
                    <Row className="justify-content-md-center">
                        <Button variant={audioStatus} onClick={() => this.toggleVideoOrAudio("audio") }><FontAwesomeIcon icon={faMicrophone} /></Button>
                        <Button variant={videoStatus} className="mx-3" onClick={() => this.toggleVideoOrAudio("video") }><FontAwesomeIcon icon={faVideo} /></Button>
                        <Button variant="light"  onClick={() => this.createDetachedWindow() }>Detach</Button>
                        <Link to={{
                            pathname: `/`
                        }}>
                            <Button variant="danger"><FontAwesomeIcon icon={faDoorClosed} className="mr-2" />Leave</Button>
                        </Link>
                    </Row>
                </div>
            </React.Fragment>
        );
    }
}

export default Room;
