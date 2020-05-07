import React from 'react';
import { ipcRenderer } from 'electron';
import update from 'immutability-helper';
import { each, debounce } from 'lodash';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Row, Col, TabContainer, OverlayTrigger, Overlay, Popover, Tooltip } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { 
    faCircleNotch, 
    faSignOutAlt, 
    faMicrophone, 
    faMicrophoneSlash, 
    faVideo, 
    faVideoSlash, 
    faDoorClosed, 
    faDoorOpen, 
    faCircle, 
    faGrin, 
    faLayerGroup, 
    faLessThanEqual, 
    faUser, 
    faLock 
} from '@fortawesome/free-solid-svg-icons';
import { Janus } from 'janus-gateway';
import Pusher from 'pusher-js';
import VideoList from './VideoList';
import AddUserToRoomModal from './AddUserToRoomModal';

class Room extends React.Component {
    constructor(props) {
    
        super(props);

        this.state = {
            room: {},
            team: {},
            loading: true,
            members: [],
            server: null,
            local_stream: null,
            publishers: [],
            me: {},
            connected: false,
            publishing: false,
            leaving: false,
            videoSizes: {
                width: 0,
                height: 0,
                display: "row align-items-center justify-content-center h-100",
                containerHeight: window.innerHeight - 114
            },
            talking: [],
            local_video_container: [],
            videoStatus: false,
            audioStatus: true,
            streamer_server_connected: false,
            videoRoomStreamerHandle: null,
            rootStreamerHandle: null,
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
            ],
            showAddUserToRoomModal: false,
        }

        this.initializeRoom = this.initializeRoom.bind(this);

        this.createDetachedWindowBound = this.createDetachedWindow.bind(this);

        this.toggleVideoOrAudio = this.toggleVideoOrAudio.bind(this);
        this.handleRemoteStreams = this.handleRemoteStreams.bind(this);
        this.subscribeToRemoteStream = this.subscribeToRemoteStream.bind(this);
        this.updateDisplayedVideosSizes = this.updateDisplayedVideosSizes.bind(this);

        this.stopPublishingStream = this.stopPublishingStream.bind(this);

        //this.updateDisplayedVideos = debounce(this.updateDisplayedVideos, 200);

        this.openMediaHandle = this.openMediaHandle.bind(this);
        this.renderVideo = this.renderVideo.bind(this);

        this.reconnectNetworkConnections = this.reconnectNetworkConnections.bind(this);
        this.disconnectNetworkConnections = this.disconnectNetworkConnections.bind(this);
        this.getNewServer = this.getNewServer.bind(this);

    }

    componentDidMount() {
        const { teams, match, location, pusherInstance } = this.props;

        window.addEventListener('online',  this.reconnectNetworkConnections);
        window.addEventListener('offline',  this.disconnectNetworkConnections);

        ipcRenderer.on('power_update', (event, arg) => {
            if (arg == "suspend" || arg == "lock-screen") {
                this.disconnectNetworkConnections();
            }
            if (arg == "unlock-screen" || arg == "resume") {
                this.reconnectNetworkConnections();
            }
        })

        Janus.init({
            debug: true,
            dependencies: Janus.useDefaultDependencies(),
            callback: function() {
                    // Done!
            }
        });

        if (pusherInstance != null) {
            this.initializeRoom();
        }

    }

    componentDidUpdate(prevProps, prevState) {
        const { dimensions, match, location } = this.props;
        const { publishers, publishing, rootStreamerHandle } = this.state;

        var that = this;

        //check if our room changed
        if (prevProps.match.params.roomSlug != match.params.roomSlug) {
            if (rootStreamerHandle != null) {
                for(var s in Janus.sessions) {
                    Janus.sessions[s].destroy({
                        unload: true, 
                        notifyDestroyed: false,
                        success: function() {
                            //Janus.sessions.splice(s, 1);
                            delete Janus.sessions[s];
                            console.log(Janus.sessions);
                        }
                    });
                }

                this.setState({
                    loading: true,
                    members: [],
                    server: null,
                    local_stream: null,
                    publishers: [],
                    me: {},
                    connected: false,
                    publishing: false,
                }, () => {
                    this.initializeRoom();
                });
            }
        }

        if (prevProps.dimensions != dimensions || prevState.publishers.length != publishers.length) {
            this.updateDisplayedVideosSizes(null, true);
        }

        if ((prevState.publishers != publishers && publishers.length > 0) && publishing) {
            this.handleRemoteStreams();
        }
    }
    
    componentWillUnmount() {
        const { pusherInstance } = this.props;
        const { me, room, rootStreamerHandle, publishers, local_stream, publishing } = this.state;

        if (typeof room.channel_id != 'undefined' && typeof pusherInstance != "undefined" &&  pusherInstance != null) {
            pusherInstance.unsubscribe(`presence-room.${room.channel_id}`);
        }

        try {
            if (publishing) {
                this.stopPublishingStream();
            }
            rootStreamerHandle.destroy({
                success: function() {

                }
            });
        } catch (error) {
            //do something
        }

        window.removeEventListener('online',  this.reconnectNetworkConnections);
        window.removeEventListener('offline',  this.disconnectNetworkConnections);
    }

    initializeRoom() {
        const { teams, match, location, pusherInstance, getRoomUsers } = this.props;

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

        //refresh the count of users in this room
        getRoomUsers(curRoom.id);

        var timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        this.setState({ room: curRoom, team: curTeam });

        if (pusherInstance != null) {
            var presence_channel = pusherInstance.subscribe(`presence-room.${curRoom.channel_id}`);
            var that = this;

            presence_channel.bind_global(function(event, data) {

                if (event == "pusher:subscription_succeeded") {
                    that.setState({ members: data.members, me: data.me, server: data.me.info.media_server  });
                    that.openMediaHandle();
                }

                if (event == "room.user.invited" && that.state.showAddUserToRoomModal == false) {
                    getRoomUsers(curRoom.id);
                }

                if (event == "room.server.updated" && data.triggered_by != that.state.me.id) {
                    that.getNewServer();
                }

            });
            
        }
    }

    getNewServer() {
        this.disconnectNetworkConnections();
        this.reconnectNetworkConnections();

        if (this.state.publishing) {
            this.startPublishingStream();
        }
    }

    reconnectNetworkConnections() {
        const { pusherInstance } = this.props;
        const { room, showAddUserToRoomModal } = this.state

        Janus.init({
            debug: true,
            dependencies: Janus.useDefaultDependencies(),
            callback: function() {
            }
        });

        var presence_channel = pusherInstance.subscribe(`presence-room.${room.channel_id}`);
        var that = this;
        
        presence_channel.bind_global(function(event, data) {

            if (event == "pusher:subscription_succeeded") {
                that.setState({ members: data.members, me: data.me, server: data.me.info.media_server  });
                that.openMediaHandle();
            }

            if (event == "room.user.invited" && that.state.showAddUserToRoomModal == false) {
                getRoomUsers(curRoom.id);
            }

        });
    }

    disconnectNetworkConnections() {
        const { pusherInstance } = this.props;
        const { me, room, rootStreamerHandle, publishers, local_stream, publishing } = this.state;
        if (typeof room.channel_id != 'undefined' && pusherInstance != null) {
            pusherInstance.unsubscribe(`presence-room.${room.channel_id}`);
        }

        if (publishing) {
            this.stopPublishingStream();
        }

        var that = this;

        try {
            rootStreamerHandle.destroy({
                success: function() {
                    that.setState({ publishers: [], talking: [] })
                }
            });
        } catch (error) {
            //do something
        }
    }

    openMediaHandle() {
        var { me, room, team, local_stream, server } = this.state;
        var that = this;

        if (server == null) {
            return false;
        }

        /*if (rootStreamerHandle != null && rootStreamerHandle.isConnected()) {
            console.log("STILL CONNECTED");
            console.log(rootStreamerHandle)
            rootStreamerHandle.destroy({
                success: function() {
                    console.log("CALLING AGAIN");
                    return that.openMediaHandle();
                }
            });
        }*/

        var rootStreamerHandle = new Janus(
        {
            server: [`wss://${server}:4443/`, `https://${server}/streamer`],
            success: function(handle) {

                console.log("CONNECTED");
                console.log(handle);
                console.log(rootStreamerHandle);

                that.setState({ rootStreamerHandle });

                rootStreamerHandle.attach({
                    plugin: "janus.plugin.videoroom",
                    opaqueId: me.info.peer_uuid,
                    success: function(videoRoomStreamerHandle) {
                        that.setState({ videoRoomStreamerHandle });

                        //register a publisher
                        var request = { 
                            "request":  "join", 
                            "room": room.channel_id, 
                            "ptype": "publisher",
                            "display": me.info.peer_uuid,
                            "token": me.info.streamer_key
                        }

                        videoRoomStreamerHandle.send({ "message": request });
                    
                    },
                    error: function(cause) {
                            // Couldn't attach to the plugin
                            if (that.props.pusherInstance.connection.state == "connected") {
                                that.getNewServer();
                            }
                    },
                    onmessage: function(msg, jsep) {
                        var { videoRoomStreamerHandle, currentLoadingMessage, containerBackgroundColors, members } = that.state;

                        console.log("ROOT MSG");
                        console.log(msg);
                        console.log(jsep);
    
                        if (jsep != null) {
                            videoRoomStreamerHandle.handleRemoteJsep({ "jsep": jsep });
                        }

                        if (msg.videoroom == "joined") {
                            console.log("JOINED");
                            console.log(msg);

                            if (msg.publishers.length > 0) { 

                                let updatedPublishers = [];
                                
                                msg.publishers.forEach(publisher => {
                                    var rand = Math.floor(Math.random() * containerBackgroundColors.length);
                                    each(members, function(member) {
                                        if (member.peer_uuid == publisher.display) {
                                            publisher.member = member;
                                        }
                                    }) 
                                    publisher.containerBackgroundColor = containerBackgroundColors[rand];

                                    if (typeof publisher.loading == "undefined") {
                                        publisher.loading = false;
                                    }

                                    updatedPublishers.push(publisher);
                                })

                                that.setState({ connected: true, loading: false, publishers: updatedPublishers });
                            } else {
                                currentLoadingMessage = [];

                                currentLoadingMessage.push(
                                    <div key={99999}>
                                        <h1 className="text-center">This room is empty.</h1>
                                        <h2 className="text-center h3">Your teammates will appear here automatically after joining.</h2>
                                    </div>
                                );

                                that.setState({ connected: true, loading: false, currentLoadingMessage }); 
                            }
                        }

                        if (msg.videoroom == "talking") {
                            var updatedTalking = [];

                            updatedTalking.push(msg.id);

                            that.state.talking.forEach(talking => {
                                updatedTalking.push(talking);
                            })

                            that.setState({ talking: updatedTalking });

                        }

                        if (msg.videoroom == "stopped-talking") {
                            var updatedTalking = [];

                            that.state.talking.forEach(talking => {
                                if (talking != msg.id) {
                                    updatedTalking.push(talking);
                                }
                            })

                            that.setState({ talking: updatedTalking });
                        }

                        if (msg.videoroom == "event") {
                            //check if we have new publishers to subscribe to
                            if (typeof msg.publishers != "undefined") {
                                let newPublishers = msg.publishers;

                                let rand = Math.floor(Math.random() * containerBackgroundColors.length); 
                                var currentPublishers = that.state.publishers;

                                newPublishers.forEach(publisher => {
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

                                currentPublishers.filter(publisher => {
                                    var keep = true;
                                    newPublishers.forEach(newPublisher => {
                                        if (newPublisher.member.id == publisher.member.id) {
                                            keep = false;
                                        }
                                    })

                                    return keep;

                                })

                                that.setState({ publishers: [ ...newPublishers, ...currentPublishers ] });
                            }

                            if (typeof msg.leaving != "undefined") {
                                const updatedPublishers = that.state.publishers.filter(item => {
                                    return item.id != msg.leaving;
                                })

                                that.setState({ publishers: updatedPublishers });
                
                            }

                            if (typeof msg.unpublished != "undefined") {
                                const updatedPublishers = that.state.publishers.filter(item => {
                                    return item.id != msg.unpublished;
                                })

                                that.setState({ publishers: updatedPublishers });
                
                            }
                        }
                    },
                    ondataopen: function(data) {
                        console.log("open");
                        console.log(data);
                    },
                    ondata: function(data) {
                        
                    },
                    slowLink: function(slowLink) {
                        console.log("root slowlink message", slowLink);
                    },
                    mediaState: function(mediaState) {
                        console.log("root media state message", mediaState);
                    },
                    oncleanup: function() {
                            // PeerConnection with the plugin closed, clean the UI
                            // The plugin handle is still valid so we can create a new one
                    },
                    detached: function() {
                            // Connection with the plugin closed, get rid of its features
                            // The plugin handle is not valid anymore
                    },
                    destroyed: function() {

                    }
                })

            },
            error: function(cause) {
                    // Error, can't go on...

                    //sanity check to make sure we still have an internet connection
                    if (that.props.pusherInstance.connection.state == "connected") {
                        that.getNewServer();
                    }
            },
            destroyed: function() {
                    // I should get rid of this
            }
        });

    }

    async startPublishingStream() {
        const { settings } = this.props;
        var { videoRoomStreamerHandle, audioStatus, videoStatus } = this.state;

        let streamOptions;
        /* TODO: Manually prompt for camera and microphone access on macos to handle it more gracefully - systemPreferences.getMediaAccessStatus(mediaType) */
        if (settings.defaultDevices != null) {
            streamOptions = {
                video: {
                    aspectRatio: 1.3333333333,
                    deviceId: settings.defaultDevices.videoInput
                },
                audio: {
                    deviceId: settings.defaultDevices.audioInput
                }
            }
        } else {
            streamOptions = {
                video: {
                    aspectRatio: 1.3333333333,
                },
                audio: true
            }
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
        videoRoomStreamerHandle.createOffer({
            stream: local_stream,
            success: function(jsep) {
                var request = {
                    "request": "publish",
                    "audio": audioStatus,
                    "video": videoStatus,
                    "videocodec": "vp9"
                }

                videoRoomStreamerHandle.send({ "message": request, "jsep": jsep });

                var local_video_container = [];
                if (videoStatus) {
                    local_video_container.push(
                        <div style={{width:106.66,height:80}} key={999} className="align-self-center">
                            <video autoPlay muted ref={that.renderVideo(that.state.local_stream)} style={{height:80 }} className="rounded shadow"></video>
                        </div>
                    )
                } else {
                    local_video_container.push(
                        <div key={999} style={{height:80}}>
                            <div className="d-none d-md-block">
                                <div style={{width:106.66,height:80}} className="align-self-center">
                                    <p style={{height:80,paddingTop:25,paddingLeft:2,fontWeight:"bolder",fontSize:"1.1rem"}}>Video Off</p>
                                </div>
                            </div>
                        </div>
                    )
                }

                that.setState({ publishing: true, local_video_container });

                that.handleRemoteStreams();
            }
        })
    }

    stopPublishingStream() {
        const { videoRoomStreamerHandle, local_stream, publishers } = this.state;

        if (videoRoomStreamerHandle == null) {
            return;
        }

        var request = {
            "request": "unpublish"
        }

        videoRoomStreamerHandle.send({ "message": request });

        if (local_stream != null) {
            const tracks = local_stream.getTracks();

            tracks.forEach(function(track) {
                track.stop();
            })
        }

        publishers.forEach((publisher, key) => {
            if (typeof publisher.handle != "undefined" && publisher.handle != null) {
                publisher.handle.detach();
            }

            publishers[key].stream = null;
            publishers[key].handle = null;
            publishers[key].active = false;
        })

        publishers.filter(publisher => {
            return publisher.active;
        })

        this.setState({ publishing: false, local_stream: null, publishers })
        
    }

    handleRemoteStreams() {
        var { publishers } = this.state;

        publishers.forEach((publisher, key) => {
            if (typeof publisher.handle == "undefined" || publisher.handle == null) {
                this.subscribeToRemoteStream(publisher, key);
            }
        })
    }

    subscribeToRemoteStream(publisher, key) {
        const { me, room, publishers, rootStreamerHandle } = this.state;

        var handle;
        var that = this;

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
                    if (that.props.pusherInstance.connection.state == "connected") {
                        that.getNewServer();
                    }
            },
            onmessage: function(msg, jsep) {
                console.log("REMOTE MSG");
                console.log(msg);
                console.log(jsep);
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
                    console.log(track);
                    if (track.kind == "video" && track.enabled) {
                        hasVideo = true;
                    }
                    if (track.kind == "audio" && track.enabled) {
                        hasAudio = true;
                    }
                })

                //make sure this publisher still exists
                if (typeof publishers[key] != "undefined") {
                    publishers[key].stream = remote_stream;
                    publishers[key].hasVideo = hasVideo;
                    publishers[key].hasAudio = hasAudio;
                    publishers[key].handle = handle;
                    publishers[key].active = true;

                    that.setState({ publishers });
                }

                console.log(that.state.publishers);

            },
            ondataopen: function(data) {
                console.log("open");
                console.log(data);
            },
            ondata: function(data) {
                
            },
            slowLink: function(slowLink) {
                console.log("remote slowlink message", slowLink);
            },
            mediaState: function(mediaState) {
                console.log("remote media state message", mediaState);
            },
            oncleanup: function() {
            },
            detached: function() {
            }
        });
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

        var rows = 1;
        var columns = 1;
    
        if (remote_streams_count > 0) {
            if (remote_streams_count >= 2) {

                if (dimensions.width > 980) {
                    
                    if (remote_streams_count > 2) {
                        rows = 2;
                    }
    
                    if (remote_streams_count >= 2 && remote_streams_count <= 4) {
                        columns = 2;
                    }
    
                    if (remote_streams_count > 4 && remote_streams_count <= 6) {
                        columns = 3;
                    }
    
                    if (remote_streams_count > 6 && remote_streams_count <= 8) {
                        columns = 4;
                    }

                    if (remote_streams_count > 8 && remote_streams_count <= 12) {
                        rows = 3;
                        columns = 4;
                    }

                    if (remote_streams_count > 12 && remote_streams_count <= 16) {
                        rows = 4;
                        columns = 4;
                    }

                    if (remote_streams_count > 16 && remote_streams_count <= 20) {
                        rows = 4;
                        columns = 5;
                    }

                    if (remote_streams_count > 20 && remote_streams_count <= 25) {
                        rows = 5;
                        columns = 5;
                    }

                } else {
                    if (remote_streams_count == 2) {
                        rows = 2;
                    }

                    if (remote_streams_count > 2) {
                        columns = 2;
                        rows = 2;
                    }
    
                    if (remote_streams_count > 2 && remote_streams_count <= 4) {
                        rows = remote_streams_count;
                        columns = 1;
                    }
    
                    if (remote_streams_count > 4) {
                        rows = Math.floor(remote_streams_count / 2);
                        columns = 2;
                    }
                }

            }

            var aspectRatio = 4 / 3;

            height = Math.round( width / aspectRatio );

            while(((height * rows) > (dimensions.height - 250)) || ((width * columns) > (dimensions.width - 375))) {
                width = width - 5;
                height = Math.round( width / aspectRatio );
            }

            var display = "row align-items-center justify-content-center h-100";

            if (dimensions.width < 1080) {
                display = "row align-items-center justify-content-center h-100";
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
        var { videoRoomStreamerHandle, local_stream, videoStatus, audioStatus } = this.state;

        if (typeof local_stream !== 'undefined') {
            var tracks = local_stream.getTracks();
            
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

            if (videoRoomStreamerHandle != null) {
                //update our published stream
                var request = {
                    "request": "configure",
                    "audio": audioStatus,
                    "video": videoStatus,
                    "videocodec": "vp9"
                }

                console.log(request);

                videoRoomStreamerHandle.send({ "message": request });
            }

            if (type == "video") {
                var local_video_container = [];
                if (videoStatus) {
                    local_video_container.push(
                        <div style={{width:106.66,height:80}} key={999} className="align-self-center">
                            <video autoPlay muted ref={this.renderVideo(this.state.local_stream)} style={{height:80 }} className="rounded shadow"></video>
                        </div>
                    )
                } else {
                    local_video_container.push(
                        <div style={{width:106.66,height:80}} key={999} className="align-self-center">
                            <p style={{height:80,paddingTop:25,paddingLeft:2,fontWeight:"bolder",fontSize:"1.1rem"}}>Video Off</p>
                        </div>
                    )
                }
            }

            if (typeof local_video_container != "undefined") {
                return this.setState({ local_video_container, videoStatus, audioStatus });
            }

            this.setState({ videoStatus, audioStatus });
        }
    }

    render() {
        const { 
            getRoomUsers, 
            roomUsers, 
            roomLoading, 
            user, 
            organizationUsers,
            addUserToRoom,
            addUserLoading,
            currentTime
        } = this.props;

        const { 
            room, 
            loading, 
            publishers, 
            publishing,
            talking,
            local_stream, 
            local_video_container,
            videoStatus, 
            audioStatus, 
            videoSizes, 
            currentLoadingMessage,
            showAddUserToRoomModal 
        } = this.state;

        return (
            <React.Fragment>
                <AddUserToRoomModal 
                    users={roomUsers}
                    organizationUsers={organizationUsers}
                    me={user}
                    room={room}
                    loading={roomLoading.toString()}
                    addUserLoading={addUserLoading}
                    show={showAddUserToRoomModal}
                    handleSubmit={addUserToRoom}
                    getRoomUsers={getRoomUsers}
                    onShow={() => getRoomUsers(room.id)}
                    onHide={() => this.setState({ showAddUserToRoomModal: false })}
                />
                <Row className="text-light pl-0 ml-0" style={{height:80,backgroundColor:"#121422"}}>
                    <Col xs={{span:4}} md={{span:5}}>
                        <div className="d-flex flex-row justify-content-start">
                            <div className="align-self-center">
                                <p style={{fontWeight:"bolder",fontSize:"1rem"}} className="pb-0 mb-0">{room.is_private ? <FontAwesomeIcon icon={faLock} style={{fontSize:".65rem"}} /> : '# '} {room.name}</p>
                                {room.is_private ?
                                    <OverlayTrigger placement="bottom-start" overlay={<Tooltip id="tooltip-view-members">View current members of this private room and add new ones.</Tooltip>}>
                                        <span className="d-inline-block">
                                        <Button variant="link" className="pl-0 pt-0" style={{color:"#fff",fontSize:".7rem"}} onClick={() => this.setState({ showAddUserToRoomModal: true })}><FontAwesomeIcon icon={faUser} /> {roomUsers.length > 0 ? roomUsers.length : '' }</Button>
                                        </span>
                                    </OverlayTrigger>
                                :
                                <OverlayTrigger placement="bottom-start" overlay={<Tooltip id="tooltip-view-members">This room is visible to everyone on your team.</Tooltip>}>
                                    <span className="d-inline-block">
                                    <Button variant="link" className="pl-0 pt-0" style={{color:"#fff",fontSize:".7rem", pointerEvents: 'none'}}><FontAwesomeIcon icon={faUser} /></Button>
                                    </span>
                                </OverlayTrigger>
                                }
                            </div>
                            <div style={{height:80}}></div>
                        </div>
                    </Col>
                    <Col xs={{span:4}} md={{span:2}}>
                        <div className="d-flex flex-row justify-content-center">
                            <div className="align-self-center pr-4">
                                {local_stream === null ?
                                    <Button variant="outline-success" style={{whiteSpace:'nowrap'}} className="mx-1" onClick={() => this.startPublishingStream() }><FontAwesomeIcon icon={faDoorOpen} /> Join</Button>
                                :
                                    <Button variant="outline-danger" style={{whiteSpace:'nowrap'}} className="mx-1" onClick={() => this.stopPublishingStream() }><FontAwesomeIcon icon={faDoorClosed} /> Leave</Button>
                                }
                            </div>
                            <div style={{height:80}}></div>
                        </div>
                    </Col>
                    <Col xs={{span:4}} md={{span:5}}>
                        {local_stream ?
                            <div className="d-flex flex-row flex-nowrap justify-content-end">
                                <div className="align-self-center pr-4">
                                    <Button variant={audioStatus ? "outline-success" : "outline-danger"} className="mx-1" onClick={() => this.toggleVideoOrAudio("audio") }><FontAwesomeIcon icon={audioStatus ? faMicrophone : faMicrophoneSlash} /></Button>
                                    {room.video_enabled ?
                                        <Button variant={videoStatus ? "outline-success" : "outline-danger"} className="mx-1" onClick={() => this.toggleVideoOrAudio("video") }><FontAwesomeIcon icon={videoStatus ? faVideo : faVideoSlash} /></Button>
                                    :
                                    <OverlayTrigger placement="bottom-start" overlay={<Tooltip id="tooltip-disabled">Video is disabled in this room.</Tooltip>}>
                                        <span className="d-inline-block">
                                       
                                        <Button variant={videoStatus ? "outline-success" : "outline-danger"} className="mx-1" disabled style={{ pointerEvents: 'none' }}><FontAwesomeIcon icon={videoStatus ? faVideo : faVideoSlash} /></Button>
                                        </span>
                                    </OverlayTrigger> 
                                    }
                                </div>
                                {/*<Button variant="light" className="mx-1" onClick={() => this.createDetachedWindow() }><FontAwesomeIcon icon={faLayerGroup}></FontAwesomeIcon></Button>*/}
                                {local_video_container}
                            </div>
                        : '' }
                    </Col>
                </Row>
                <Container className="ml-0 stage-container" fluid style={{height:videoSizes.containerHeight}}>
                    {loading ? 
                        <React.Fragment>
                            <h1 className="text-center mt-5">Loading Room...</h1>
                            <center><FontAwesomeIcon icon={faCircleNotch} className="mt-3" style={{fontSize:"2.4rem",color:"#6772ef"}} spin /></center> 
                        </React.Fragment>  
                    : 
                        <React.Fragment>
                            <div className={videoSizes.display}>
                                {publishers.length > 0 ?
                                    <VideoList
                                        videoSizes={videoSizes}
                                        publishers={publishers}
                                        publishing={publishing}
                                        currentTime={currentTime}
                                        user={user}
                             
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
