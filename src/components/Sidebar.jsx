import React from 'react';
import { Switch, Route, NavLink, Redirect } from 'react-router-dom';
import routes from '../constants/routes.json';
import { each, debounce } from 'lodash';
import { DateTime } from 'luxon';
import { Row, Col, Button, Navbar, Dropdown, Modal } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faCircle, faSignOutAlt, faUserFriends, faPlusSquare, faCog, faUserPlus, faUsers, faLock, faCamera } from '@fortawesome/free-solid-svg-icons';
import { getOrganizationUsers } from '../actions/organization';
import EnsureLoggedInContainer from '../containers/EnsureLoggedInContainer';
import LoginPage from '../containers/LoginPage';
import MagicLoginPage from '../containers/MagicLoginPage';
import LoadingPage from '../containers/LoadingPage';
import RoomPage from '../containers/RoomPage';
import TeamPage from '../containers/TeamPage';
import ErrorBoundary from './ErrorBoundary';
import ManageUsersModal from './ManageUsersModal';
import InviteUsersModal from './InviteUsersModal';
import ManageCameraModal from './ManageCameraModal';
import RoomsModal from './RoomsModal';

const { ipcRenderer } = require('electron')


class Sidebar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            dimensions: {
                width: 0,
                height: 0
            },
            showInviteUsersModal: false,
            showManageUsersModal: false,
            showManageCameraModal: false,
            showRoomsModal: false,
            roomsModalReset: false,
            pusherInstance: null,
            organizationPresenceChannel: false,
            organizationUsersOnline: [],
            currentTime: DateTime.local()
        }

    }

    componentDidMount() {
        var { pusherInstance, organizationPresenceChannel } = this.state;
        const { push, auth, user, organization, getOrganizations, updateUserDetails } = this.props;

        ipcRenderer.on('url_update', (event, arg) => {
            let pushUrl = arg.slice(13);

            if (pushUrl.includes('magic')) {
                push(arg.slice(13));
            }
        })

        if (organizationPresenceChannel && !auth.isLoggedIn) {
            this.setState({ organizationPresenceChannel: false, pusherInstance: null });
        }

        var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (user.timezone != timezone) {
            updateUserDetails(timezone);
        }

        window.setInterval(function () {

            var currentTime = DateTime.local();

            if (currentTime.setZone(user.timezone).toLocaleString(DateTime.TIME_SIMPLE) 
                != this.state.currentTime.setZone(user.timezone).toLocaleString(DateTime.TIME_SIMPLE)) {

                this.setState({ currentTime })
                
            }

        }.bind(this), 1000);

        if (auth.isLoggedIn && organization != null && !organizationPresenceChannel) {

            if (pusherInstance == null) {
                pusherInstance = new Pusher('3eb4f9d419966b6e1e0b', {
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

                this.setState({ pusherInstance });
            }

            var presence_channel = pusherInstance.subscribe(`presence-organization.${organization.id}`);
            var that = this;

            this.setState({ organizationPresenceChannel: true });

            presence_channel.bind_global(function(event, data) {

                if (event == "pusher:subscription_succeeded") {
                    var onlineUsers = [];

                    each(data.members, member => {
                        onlineUsers.push(member.id);
                    })

                    that.setState({ organizationUsersOnline: onlineUsers });
                }

                if (event == "pusher:member_added") {
                    var updatedOnlineUsers = [];

                    that.state.organizationUsersOnline.forEach(user => {
                        updatedOnlineUsers.push(user);
                    }) 

                    updatedOnlineUsers.push(data.id);

                    that.setState({ organizationUsersOnline: updatedOnlineUsers });
                }

                if (event == "pusher:member_removed") {
                    var updatedOnlineUsers = [];

                    that.state.organizationUsersOnline.forEach(user => {
                        if (user != data.id) {
                            updatedOnlineUsers.push(user);
                        }
                    }) 

                    that.setState({ organizationUsersOnline: updatedOnlineUsers });
                }

                if (event == "room.created" && data.created_by != user.id && !data.room.is_private) {
                    return getOrganizations();
                }

                console.log(event,data);

                if (event == "room.user.invited" && data.user == user.id) {
                    return getOrganizations();
                }

            });
        }

        if (organizationPresenceChannel && !auth.isLoggedIn) {
            this.setState({ organizationPresenceChannel: false, pusherInstance: null });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { createRoomSuccess, lastCreatedRoomSlug, location } = this.props;

        if (prevProps.createRoomSuccess != createRoomSuccess && createRoomSuccess && !location.pathname.includes("/room")) {
            this.setState({ showRoomsModal: false, roomsModalReset: true });
            return this.props.push(`/room/${lastCreatedRoomSlug}`);
        }
    }

    componentWillUnmount() {
        var { organizationPresenceChannel } = this.state;
        window.removeEventListener('resize', this.handleResize);

        if (organizationPresenceChannel) {
            pusherInstance.unsubscribe(`presence-room.${organization.id}`);
        }
    }

    render() {
        const { 
            organization, 
            teams, 
            user, 
            auth, 
            push,
            userLogout, 
            currentUrl, 
            getOrganizationUsers, 
            organizationUsers, 
            organizationLoading, 
            inviteUsers, 
            inviteUsersSuccess, 
            getAvailableDevices, 
            settings, 
            updateDefaultDevices, 
            createRoom,
            createRoomSuccess,
            lastCreatedRoomSlug
        } = this.props;
        const { 
            currentTime,
            showInviteUsersModal, 
            showManageUsersModal, 
            showRoomsModal, 
            roomsModalReset,
            showManageCameraModal, 
            pusherInstance,
            organizationUsersOnline
        } = this.state;

        teams.forEach(team => {
            if (team.name.length > 20) {
                team.name = team.name.slice(0, 16);
                team.name = team.name.trim() + "...";
            }
        })
    
        const rooms = teams.map((team, teamKey) =>
            <div key={teamKey} className="mt-2">
                <Row>
                    <Col xs={9}>
                        <p className="text-light pt-1 mb-0 pl-3" style={{fontSize:"1rem",fontWeight:800}}>Rooms</p>
                    </Col>
                    <Col xs={3}>
                        <Button variant="link" style={{color:"#fff",fontSize:".9rem"}} onClick={() => this.setState({ showRoomsModal: true })}><FontAwesomeIcon icon={faPlusSquare} /></Button>
                    </Col>
                </Row>
                <div className="vh-100" style={{overflowY:"scroll",paddingBottom:215}}>
                    {team.rooms.length > 0 ?
                        <ul className="nav flex-column mt-1">
                            {team.rooms.map((room, roomKey) => 
                                <li key={roomKey} className="nav-item">
                                    <NavLink exact={true} 
                                            activeStyle={{
                                                fontWeight: "bold",
                                                backgroundColor:"#4381ff"
                                            }} 
                                            className="d-block py-1"
                                            to={{
                                                pathname: `/room/${room.slug}`,
                                                state: {
                                                    team: team,
                                                    room: room
                                                }
                                            }}>
                                        <p className="text-light mb-0 pl-3">{room.is_private ? <FontAwesomeIcon icon={faLock} style={{fontSize:".7rem",marginRight:".2rem"}} /> : <span style={{marginRight:".2rem"}}>#</span>} {room.name}</p>
                                    </NavLink>
                                </li>
                            )}
                        </ul>
                    : '' }
                </div>
            </div>
        )
                                        
        var firstRoom = {};
        try {
            teams.forEach(team => {
                if (team.rooms.length > 0) {
                    team.rooms.forEach(room => {
                        firstRoom = {
                            slug: room.slug,
                            team: team,
                            room: room
                        }
                    })
                }
            })
        } catch(error) {
            //silently fail
        }

        try {
            if (organization != null && organization.name.length > 19) {
                organization.name = organization.name.slice(0, 18);
                organization.name = organization.name.trim() + "...";
            }
        } catch(error) {
            //silently fail
        }

        return (
            <>
                <ErrorBoundary showError={true}>
                    <Switch>
                        <Route path={routes.LOGIN} component={LoginPage} />
                        <Route path={routes.MAGIC_LOGIN} component={MagicLoginPage} />
                        <Route path={routes.LOADING} component={LoadingPage} />
                        <Redirect from="/" exact to={{
                                pathname: routes.LOADING,
                        }} />
                    </Switch>
                </ErrorBoundary>
                <Switch>
                <EnsureLoggedInContainer>
                    <ErrorBoundary showError={false}>
                        <InviteUsersModal 
                            show={showInviteUsersModal}
                            handleSubmit={inviteUsers}
                            loading={organizationLoading.toString()}
                            inviteuserssuccess={inviteUsersSuccess}
                            onHide={() => this.setState({ showInviteUsersModal: false })}
                        />
                        <ManageUsersModal 
                            users={organizationUsers}
                            loading={organizationLoading.toString()}
                            show={showManageUsersModal}
                            onShow={() => getOrganizationUsers(organization.id)}
                            onHide={() => this.setState({ showManageUsersModal: false })}
                        />
                        <RoomsModal 
                            show={showRoomsModal}
                            loading={organizationLoading.toString()}
                            createroomsuccess={createRoomSuccess}
                            lastCreatedRoomSlug={lastCreatedRoomSlug}
                            roomsModalReset={roomsModalReset}
                            handleSubmit={createRoom}
                            push={push}
                            onHide={() => this.setState({ showRoomsModal: false })}
                        />
                        <ManageCameraModal 
                            show={showManageCameraModal}
                            settings={settings}
                            handleSubmit={updateDefaultDevices}
                            onShow={() => getAvailableDevices()}
                            onHide={() => this.setState({ showManageCameraModal: false })}
                        />
                    </ErrorBoundary>
                    <div style={{backgroundColor:"#1b1e2f",width:240}} className="vh-100 pr-0 float-left">
                        
                        <Navbar className="text-light pt-4" style={{height:80,backgroundColor:"#121422",borderBottom:"1px solid #1c2046"}}>
                            <ErrorBoundary showError={false}>
                                <Navbar.Brand>
                                    {organization != null ? 
                                        <p className="text-light p-0 m-0" style={{fontSize:".9rem",fontWeight:800}}>{organization.name}</p>
                                    : '' }
                                    {user != null ? 
                                        <p className="text-light pt-0 pb-1" style={{fontSize:".8rem"}}><FontAwesomeIcon icon={faCircle} className="mr-1" style={{color:"#3ecf8e",fontSize:".5rem",verticalAlign:'middle'}} /> {user.first_name}</p>
                                    : '' }
                                </Navbar.Brand>
                                <div className="ml-auto" style={{height:60}}>
                            
                                    <Dropdown className="dropdownSettings text-light">
                                        <Dropdown.Toggle><FontAwesomeIcon icon={faCog} style={{color:"#fff"}} /></Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => this.setState({ showInviteUsersModal: true })}>
                                                <FontAwesomeIcon icon={faUserPlus} /> Invite People to {organization != null ? organization.name : ''}
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.setState({ showManageCameraModal: true })}>
                                                <FontAwesomeIcon icon={faCamera} /> Camera Settings
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => userLogout() }>
                                                <FontAwesomeIcon icon={faSignOutAlt}/> Sign Out
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>

                                </div>
                            </ErrorBoundary>
                        </Navbar>
                        <div>
                            <ul className="nav flex-column mt-1">
                                <li key="people-nav-button" className="nav-item">
                                    <NavLink exact={true} 
                                        activeStyle={{
                                            fontWeight: "bold",
                                            backgroundColor:"#4381ff"
                                        }} 
                                        className="d-block py-1"
                                        to={{
                                            pathname: `/team`
                                        }}>
                                            <p className="text-light mb-0 pl-3"><FontAwesomeIcon icon={faUsers} style={{fontSize:".65rem"}} />  Team</p>
                                    </NavLink>
                                </li>
                            </ul>
                        </div>
                        <div>
                            {rooms}
                        </div>
                    </div>
                    <div className="pl-0 ml-auto" style={{borderLeft:"1px solid #1c2046",width:"100%"}}>
                
                            <>
                                <Route 
                                    path={routes.ROOM} 
                                    render={(routeProps) => (
                                        <ErrorBoundary showError={true}><RoomPage {...routeProps} pusherInstance={pusherInstance} key={routeProps.match.params.roomSlug} currentTime={currentTime} /></ErrorBoundary>
                                    )}
                                />
                                <Route 
                                    path={routes.TEAM} 
                                    render={(routeProps) => (
                                        <ErrorBoundary showError={true}><TeamPage {...routeProps} organizationUsersOnline={organizationUsersOnline} currentTime={currentTime} /></ErrorBoundary>
                                    )}
                                />
                            </>
            
                    </div>
                </EnsureLoggedInContainer>
                </Switch>
            </>
        );
    }

}

export default Sidebar;