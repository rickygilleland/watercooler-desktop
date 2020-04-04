import React from 'react';
import { each } from 'lodash';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Navbar, Row } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faSignOutAlt, faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faDoorClosed } from '@fortawesome/free-solid-svg-icons';
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
            me: {},
            connected: false,
            leaving: false
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


        this.renderVideoBound = this.renderVideo.bind(this);
    }

    async componentDidMount() {
        const { organization, teams, match, location, auth } = this.props;

        var curTeam = {};
        var curRoom = {};
        var all_members = [];
        
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

        const local_stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 1280,
                height: 720
            },
            audio: true
        });

        this.local_stream = local_stream;

        var presence_channel = this.pusher.subscribe(`presence-peers.${room.channel_id}`);

        var that = this;
        
        presence_channel.bind('pusher:subscription_succeeded', function(members) {
            that.setState({ members: members.members, me: members.me }, () => {

                    /*const peer = new Peer(members.me.info.peer_uuid, {
                        host: "peer.watercooler.work",
                        port: 443,
                        secure: true,
                        path: "/peer",
                        config: {'iceServers': [
                            { url: 'stun:global.stun.twilio.com:3478?transport=udp' },
                            { url: 'turn:global.turn.twilio.com:3478?transport=udp', username: 'f569e934ed1a75f0ab117bc44433670c463f95eaa2cda85d052baff01763ae61', credential: 'SGrBazWftYv2IHdf3XJ/adpkcMVrMqU81adDJiWDeI0='},
                            { url: 'turn:global.turn.twilio.com:443?transport=tcp', username: 'f569e934ed1a75f0ab117bc44433670c463f95eaa2cda85d052baff01763ae61', credential: 'SGrBazWftYv2IHdf3XJ/adpkcMVrMqU81adDJiWDeI0='}
                        ]},
                        debug: 3
                    });*/

                    that.peer = new Peer(members.me.info.peer_uuid, {
                        host: "peer.watercooler.work",
                        port: 443,
                        secure: true,
                        path: "/peer",
                        config: {'iceServers': [
                            { url: 'stun:global.stun.twilio.com:3478?transport=udp' }
                        ]},
                        debug: 3
                    });

                    let peer = that.peer;

                    var me = members.me;

                    peer.on('open', function(id) {

                        that.setState({ connected: true, loading: false });

                        let local_stream = that.local_stream;

                        var me = members.me;

                        each(members.members, function(member) {
                            if (member.id != me.id) {
            
                                var call = peer.call(member.peer_uuid, local_stream);
            
                                call.on('stream', function(member_stream) {

                                    all_members[member.id] = {
                                        id: member.id,
                                        name: member.name,
                                        source: member_stream,
                                        isMe: false,
                                        call: call,
                                        peer_uuid: member.peer_uuid
                                    }

                                    that.setState({remote_streams: all_members, loading: false });
                                    
                                    
                                });
                                
                            }
                        });
                        

                        peer.on('call', function(call) {
                
                            call.on('stream', function(member_stream) {
                                //save their stream to state
                                all_members.forEach(function(member, key) {
                                    if (member.peer_uuid == call.peer) {
                                        all_members[key].source = member_stream;
                                        all_members[key].isMe = false;
                                        all_members[key].call = call;
                                        all_members[key].stopped = false;
                                    }
                                });

                                that.setState({remote_streams: all_members, loading: false });

                            });
                        });

  
                    });

                    peer.on('error', function(error) {
                        console.log("ERROR");
                        console.log(error);
                        console.log(error.type);
                    });
        
        
  
                
            });
        });

        this.setState({ room: curRoom, team: curTeam });

    }

    componentDidUpdate(prevProps, prevState) {
    }

    componentWillUnmount() {
        const { streams, me } = this.state;

        if (typeof this.peer !== 'undefined') {
            this.peer.destroy();
        }

        if (typeof this.local_stream !== 'undefined') {
            const tracks = this.local_stream.getTracks();

            tracks.forEach(function(track) {
                track.stop();
            })
        }
    }

    renderVideo() {
        
    }

    render() {
        const { organization } = this.props;
        const { team, room, loading, me, members, remote_streams, connected } = this.state;

        let videos = [];

        if (me != {} && typeof this.local_stream !== 'undefined') {
            videos.push(
                <div className="col" key={me.id}>
                    <video autoPlay muted ref={
                        video => {
                            if (video != null) { video.srcObject = this.local_stream }
                        }
                    }></video>
                </div>
            )
        } 
    
        each(remote_streams, function(stream) {
            if (typeof stream !== "undefined" && typeof stream.source !== "undefined") {
                videos.push(
                    <div className="col" key={stream.id}>
                        {/* refactor later because inline function will get called twice, once with null */}
                        <video autoPlay ref={
                            video => {
                                if (video != null) { video.srcObject = stream.source }
                            }
                        }></video>
                    </div>
                )
            }
        })

        return (
            <React.Fragment>
                <Navbar bg="dark" className="text-light pt-3" expand="lg">
                    <Navbar.Brand>
                        <p className="text-light p-0 m-0"><strong>{team.name} / {room.name}</strong></p>
                    </Navbar.Brand>
                    <div className="ml-auto">
                        {connected ?
                            <p>Connected</p>
                            :
                            <p>Connecting...</p>
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
                        {videos}
                    </React.Fragment>
                
                }
                <div className="fixed-bottom bg-dark py-2">
                    <Row className="justify-content-md-center">
                        <Button variant="light"><FontAwesomeIcon icon={faMicrophone} /></Button>
                        <Button variant="light" className="mx-3"><FontAwesomeIcon icon={faVideo} /></Button>
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
