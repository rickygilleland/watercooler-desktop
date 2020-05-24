import React from 'react';
import { ipcRenderer, desktopCapturer } from 'electron';
import update from 'immutability-helper';
import { each } from 'lodash';
import { 
    Container, 
    Button, 
    Row, 
    Col, 
    OverlayTrigger, 
    Tooltip,
    Dropdown
} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { 
    faCircleNotch, 
    faMicrophone, 
    faMicrophoneSlash, 
    faVideo, 
    faVideoSlash, 
    faDoorClosed, 
    faDoorOpen, 
    faUser, 
    faLock,
    faDesktop,
    faWindowMaximize
} from '@fortawesome/free-solid-svg-icons';
import { Janus } from 'janus-gateway';
import Pusher from 'pusher-js';
import VideoList from './VideoList';
import AddUserToRoomModal from './AddUserToRoomModal';
import ScreenSharingModal from './ScreenSharingModal';
const { BrowserWindow } = require('electron').remote

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
            initialized: false,
            room_at_capacity: false,
            me: {},
            connected: false,
            publishing: false,
            screenSharingActive: false,
            showScreenSharingModal: false,
            showScreenSharingDropdown: false,
            screenSharingHandle: null,
            screenSharingStream: null,
            screenSharingWindow: null,
            screenSources: [],
            screenSourcesLoading: false,
            leaving: false,
            videoSizes: {
                width: 0,
                height: 0,
                display: "row align-items-center justify-content-center h-100",
                containerHeight: window.innerHeight - 114
            },
            dimensions: {
                width: window.innerWidth,
                height: window.innerHeight,
                sidebarWidth: 240
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

        this.getAvailableScreensToShare = this.getAvailableScreensToShare.bind(this);
        this.startPublishingScreenSharingStream = this.startPublishingScreenSharingStream.bind(this);
        this.openScreenSharingHandle = this.openScreenSharingHandle.bind(this);
        this.toggleScreenSharing = this.toggleScreenSharing.bind(this);

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

        this.handleResize = this.handleResize.bind(this);

    }

    componentDidMount() {
        const { teams, match, location, pusherInstance } = this.props;

        this.getAvailableScreensToShare();

        window.addEventListener('resize', this.handleResize);
        this.handleResize();

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

        ipcRenderer.on('update-screen-sharing-controls', (event, args) => {
            if (typeof args.toggleVideoOrAudio != "undefined") {
                return this.toggleVideoOrAudio(args.toggleVideoOrAudio);
            }

            if (typeof args.toggleScreenSharing != "undefined") {
                return this.toggleScreenSharing();
            }

            if (typeof args.leaveRoom != "undefined") {
                return this.stopPublishingStream();
            }

            ipcRenderer.invoke('update-screen-sharing-controls', {
                videoStatus: this.state.videoStatus,
                audioStatus: this.state.audioStatus,
                videoEnabled: this.state.room.video_enabled,
                screenSharingWindow: this.state.screenSharingWindow.id
            });
        })

        Janus.init({
            debug: true,
            dependencies: Janus.useDefaultDependencies(),
            callback: function() {
                    // Done!
            }
        });

        if (pusherInstance != null) {
            this.setState({ initialized: true }, () => {
                this.initializeRoom();
            });
        }

    }

    componentDidUpdate(prevProps, prevState) {
        const { match, location, pusherInstance } = this.props;
        const { initialized, dimensions, publishers, publishing, rootStreamerHandle } = this.state;

        if (pusherInstance != null && initialized == false) {
            this.setState({ initialized: true }, () => {
                this.initializeRoom();
            });
        }

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
                    initialized: false
                }, () => {
                    this.initializeRoom();
                });
            }
        }

        if (prevState.dimensions != dimensions || prevState.publishers.length != publishers.length) {
            this.updateDisplayedVideosSizes(null, true);
        }

        if ((prevState.publishers != publishers && publishers.length > 0) && publishing) {
            this.handleRemoteStreams();
        }
    }
    
    componentWillUnmount() {
        const { pusherInstance } = this.props;
        const { me, room, rootStreamerHandle, publishers, local_stream, publishing, screenSharingWindow } = this.state;

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

        if (screenSharingWindow != null) {
            screenSharingWindow.destroy();
        }

        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('online', this.reconnectNetworkConnections);
        window.removeEventListener('offline', this.disconnectNetworkConnections);
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
                    if (data.me.info.room_at_capacity) {
                        return that.setState({ loading: false, room_at_capacity: true });
                    }

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

        var rootStreamerHandle = new Janus(
        {
            server: [`wss://${server}:4443/`, `https://${server}/streamer`],
            success: function(handle) {

                that.setState({ rootStreamerHandle });

                rootStreamerHandle.attach({
                    plugin: "janus.plugin.videoroom",
                    opaqueId: me.info.peer_uuid,
                    success: function(videoRoomStreamerHandle) {
                        that.setState({ videoRoomStreamerHandle });

                        //register a publisher
                        var request = { 
                            "request":  "join", 
                            "id": me.info.id.toString(),
                            "room": room.channel_id, 
                            "ptype": "publisher",
                            "display": me.info.peer_uuid,
                            "token": me.info.streamer_key,
                            "pin": me.info.room_pin
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
                        var { videoRoomStreamerHandle, currentLoadingMessage, containerBackgroundColors, members, me } = that.state;

                        console.log("debug msg", msg);
                        console.log("debug jsep", jsep);

                        if (jsep != null) {
                            videoRoomStreamerHandle.handleRemoteJsep({ "jsep": jsep });
                        }

                        if (msg.videoroom == "joined") {
                            console.log("debug joined", msg);

                            var updatedMe = that.state.me;
                            updatedMe.info.private_id = msg.private_id;

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

                                that.setState({ connected: true, loading: false, publishers: updatedPublishers, me: updatedMe });
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
                                var newPublishers = msg.publishers;

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

                                if (newPublishers.length == 1 && newPublishers[0].display == me.info.peer_uuid) {
                                    newPublishers = [];
                                } 

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

                    },
                    ondata: function(data) {
                        
                    },
                    slowLink: function(slowLink) {

                    },
                    mediaState: function(mediaState) {

                    },
                    webrtcState: function(state) {
                        console.log("debug webrtcstate", state);
                    },
                    iceState: function(state) {
                        console.log("debug icestate", state);
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
                    "data": true,
                    "videocodec": "vp9"
                }
                /*var request = {
                    "request": "publish",
                    "captureDesktopAudio": false,
                    "video": "screen",
                    "data": true,
                    "videocodec": "vp9"
                }*/

                videoRoomStreamerHandle.send({ "message": request, "jsep": jsep });

                var local_video_container = [];
                if (videoStatus) {
                    local_video_container.push(
                        <div style={{width:106.66,height:80}} key={999} className="align-self-center">
                            <video autoPlay muted ref={that.renderVideo(that.state.local_stream)} style={{height:80 }} className="rounded shadow"></video>
                        </div>
                    )
                } 

                that.setState({ publishing: true, local_video_container });

                that.handleRemoteStreams();
            }
        })
    }

    stopPublishingStream() {
        const { videoRoomStreamerHandle, screenSharingHandle, screenSharingStream, screenSharingWindow, local_stream, publishers } = this.state;

        if (videoRoomStreamerHandle == null) {
            return;
        }

        var request = {
            "request": "unpublish"
        }

        videoRoomStreamerHandle.send({ "message": request });

        if (screenSharingHandle != null) {
            screenSharingHandle.send({ "message": request });

            if (screenSharingStream != null) {
                const screenSharingTracks = screenSharingStream.getTracks();

                screenSharingTracks.forEach(function(track) {
                    track.stop();
                })
            }
        }

        if (screenSharingWindow != null) {
            screenSharingWindow.destroy();
        }

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

        this.setState({ publishing: false, local_stream: null, publishers, screenSharingActive: false, screenSharingWindow: null })
        
    }
    
    openScreenSharingHandle() {
        var { rootStreamerHandle, me, room } = this.state;

        var that = this;

        rootStreamerHandle.attach({
            plugin: "janus.plugin.videoroom",
            opaqueId: me.info.peer_uuid,
            success: function(screenSharingHandle) {
                that.setState({ screenSharingHandle });

                //register a publisher
                var request = { 
                    "request":  "join", 
                    "id": me.info.id.toString()+"_screensharing",
                    "room": room.channel_id, 
                    "ptype": "publisher",
                    "display": me.info.peer_uuid,
                    "token": me.info.streamer_key,
                    "pin": me.info.room_pin
                }

                screenSharingHandle.send({ "message": request });

                return that.startPublishingScreenSharingStream();
            
            },
            onmessage: function(msg, jsep) {
                const { screenSharingHandle } = that.state;

                if (jsep != null) {
                    screenSharingHandle.handleRemoteJsep({ "jsep": jsep });
                }

            },
            error: function(cause) {
                // Couldn't attach to the plugin
            },
        });
    }

    async startPublishingScreenSharingStream() {
        var { screenSharingHandle, screenSharingStream, me, room } = this.state;

        if (screenSharingHandle == null) {
            console.log("debug creating new screen sharinig handle", screenSharingHandle);
            return this.openScreenSharingHandle();
        }

        var that = this;

        screenSharingHandle.createOffer({
            stream: screenSharingStream,
            success: function(jsep) {
                var request = {
                    "request": "publish",
                    "audio": false,
                    "video": true,
                    "videocodec": "vp9"
                }

                screenSharingHandle.send({ "message": request, "jsep": jsep });

                ipcRenderer.invoke('get-current-window-dimensions').then((result) => {
                    var x = result.width - (result.width / 2) - 150;
                    var y = result.height - 85;
                    let screenSharingWindow = new BrowserWindow({ 
                        width: 300, 
                        height: 90,
                        x,
                        y,
                        frame: false,
                        transparent: true,
                        alwaysOnTop: true,
                        visibleOnAllWorkspaces: true,
                        hasShadow: false,
                        resizable: true,
                        webPreferences: {
                            nodeIntegration: true,
                            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
                            devTools: true
                        }
                    })
                      
                    screenSharingWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY+"#/screensharing_controls");

                    ipcRenderer.invoke('update-screen-sharing-controls', { starting: true });
    
                    that.setState({ screenSharingActive: true, screenSharingWindow });                    
                })

            }
        })

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

        console.log("subscribinig", publisher);

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
                    "private_id": me.info.private_id,
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

            },
            ondataopen: function(data) {

            },
            ondata: function(data) {
                
            },
            slowLink: function(slowLink) {

            },
            mediaState: function(mediaState) {

            },
            oncleanup: function() {
            },
            detached: function() {
            }
        });
    }

    handleResize() {
        const { dimensions, publishers } = this.state;

        var newWidth = window.innerWidth;
        var newHeight = window.innerHeight;

        if (publishers.length > 0) {
            this.setState({ dimensions: { width: newWidth, height: newHeight, sidebarWidth: dimensions.sidebarWidth } });
        }

    }

    updateDisplayedVideosSizes() {
        var { dimensions, videoSizes, publishers} = this.state;

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
                containerHeight: dimensions.height - 80,
                rows,
                columns
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
        var { videoRoomStreamerHandle, local_stream, videoStatus, audioStatus, screenSharingWindow } = this.state;

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
                } 
            }

            if (screenSharingWindow != null) {

                ipcRenderer.invoke('update-screen-sharing-controls', {
                    videoStatus,
                    audioStatus,
                    videoEnabled: this.state.room.video_enabled,
                    screenSharingWindow: screenSharingWindow.id
                });
            }

            if (typeof local_video_container != "undefined") {
                return this.setState({ local_video_container, videoStatus, audioStatus });
            }

            this.setState({ videoStatus, audioStatus });  

        }
    }

    async getAvailableScreensToShare() {
        var screenSources = [];

        const sources = await desktopCapturer.getSources({
            types: ['window', 'screen'],
            thumbnailSize: { width: 1000, height: 1000 },
            fetchWindowIcons: true
        });

        sources.forEach(source => {
            if (!source.name.includes("Water Cooler")) {
                var icon = null;
                if (source.appIcon != null) {
                    icon = source.appIcon.toDataURL();
                }
                var newSource = {
                    icon,
                    display_id: source.display_id,
                    id: source.id,
                    name: source.name,
                    thumbnail: source.thumbnail.toDataURL()
                }
                screenSources.push(newSource);
            }
        })

        this.setState({ screenSources, screenSourcesLoading: false })
    }

    async toggleScreenSharing(streamId = null) {
        const { screenSharingHandle, screenSharingActive, screenSources, screenSharingStream, screenSharingWindow } = this.state;

        if (screenSharingActive && streamId == null) {

            var request = {
                "request": "unpublish"
            }

            if (screenSharingHandle != null) {
                screenSharingHandle.send({ "message": request });
            }
            
            if (screenSharingStream != null) {
                const screenSharingTracks = screenSharingStream.getTracks();

                screenSharingTracks.forEach(function(track) {
                    track.stop();
                })

            }

            if (screenSharingWindow != null) {
                screenSharingWindow.destroy();
            }

            return this.setState({ screenSharingActive: false, screenSharingStream: null, screenSharingWindow: null });
        }

        if (streamId == "entire-screen") {
            screenSources.forEach(source => {
                if (source.name == "Entire Screen") {
                    streamId = source.id;
                }
            })


        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: streamId,
                        minWidth: 1280,
                        maxWidth: 1920,
                        minHeight: 720,
                        maxHeight: 1080
                    }
                }
            })

            this.setState({ screenSharingStream: stream });

            this.startPublishingScreenSharingStream();
        } catch (e) {
            //show an error
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
            room_at_capacity,
            publishers, 
            publishing,
            talking,
            screenSharingActive,
            screenSources,
            screenSourcesLoading,
            showScreenSharingModal,
            showScreenSharingDropdown,
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
                <ScreenSharingModal 
                    sources={screenSources}
                    show={showScreenSharingModal}
                    loading={screenSourcesLoading}
                    handleSubmit={this.toggleScreenSharing}
                    onShow={() => this.getAvailableScreensToShare()}
                    onHide={() => this.setState({ showScreenSharingModal: false })}
                />
                <Row className="text-light pl-0 ml-0" style={{height:80,backgroundColor:"#121422"}}>
                    <Col xs={{span:4}} md={{span:5}}>
                        <div className="d-flex flex-row justify-content-start">
                            <div className="align-self-center">
                                <p style={{fontWeight:"bolder",fontSize:"1rem"}} className="pb-0 mb-0">{room.is_private ? <FontAwesomeIcon icon={faLock} style={{fontSize:".7rem",marginRight:".2rem"}} /> : <span style={{marginRight:".2rem"}}>#</span>} {room.name}</p>
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
                            <div className="align-self-center">
                                {loading ?
                                        ''
                                    :
                                        local_stream === null ?
                                            !room_at_capacity ?
                                                <Button variant="outline-success" style={{whiteSpace:'nowrap'}} className="mx-1" onClick={() => this.startPublishingStream() }><FontAwesomeIcon icon={faDoorOpen} /> Join</Button>
                                            :
                                                <Button variant="outline-success" style={{whiteSpace:'nowrap'}} className="mx-1" disabled><FontAwesomeIcon icon={faDoorOpen} /> Join</Button>
                                        :   
                                            <Button variant="outline-danger" style={{whiteSpace:'nowrap'}} className="mx-1" onClick={() => this.stopPublishingStream() }><FontAwesomeIcon icon={faDoorClosed} /> Leave</Button>
                                }
                            </div>
                            <div style={{height:80}}></div>
                        </div>
                    </Col>
                    <Col xs={{span:4}} md={{span:5}} className="pr-0">
                        {local_stream ?
                            <div className="d-flex flex-row flex-nowrap justify-content-end">
                                <div className="align-self-center pr-4">
                                    {screenSharingActive ? 
                                        <Button variant="outline-danger" className="mx-1" onClick={() => this.toggleScreenSharing()}><FontAwesomeIcon icon={faDesktop} /></Button>
                                    :
                                        <Dropdown className="btn p-0 m-0" as="span">
                                            <Dropdown.Toggle variant="outline-info" id="screensharing-dropdown" className="mx-1 no-carat">
                                                <FontAwesomeIcon icon={faDesktop} />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu show={showScreenSharingDropdown}>
                                                <Dropdown.Item className="no-hover-bg"><Button variant="outline-info" className="btn-block" onClick={() => this.toggleScreenSharing("entire-screen")}><FontAwesomeIcon icon={faDesktop} /> Share Whole Screen</Button></Dropdown.Item>
                                                <Dropdown.Item className="no-hover-bg"><Button variant="outline-info" className="btn-block" onClick={() => this.setState({ showScreenSharingModal: true, screenSourcesLoading: true, showScreenSharingDropdown: false })}><FontAwesomeIcon icon={faWindowMaximize} /> Share a Window</Button></Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    }
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
                                <div style={{height:80}}></div>
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
                        !room_at_capacity ?
                            <React.Fragment>
                                <div className={videoSizes.display}>
                                    {publishers.length > 0 ?
                                        <VideoList
                                            videoSizes={videoSizes}
                                            publishers={publishers}
                                            publishing={publishing}
                                            currentTime={currentTime}
                                            user={user}
                                            talking={talking}
                                            renderVideo={this.renderVideo}
                                        ></VideoList>
                                    :
                                        currentLoadingMessage
                                    }
                                </div>
                            </React.Fragment>
                        :
                        <React.Fragment>
                            <h1 className="text-center mt-5">Oops!</h1>
                            <h2 className="text-center h3" style={{fontWeight:600}}>This room is at capacity and cannot be joined.</h2>
                            <p className="text-center h3" style={{fontWeight:500}}>Free plans have a limit of 5 people in a room at a time.</p>
                        </React.Fragment>
                    }
                </Container>
            </React.Fragment>
        );
    }
}

export default Room;
