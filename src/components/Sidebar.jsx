import React from 'react';
import { Switch, Route, NavLink, Redirect } from 'react-router-dom';
import routes from '../constants/routes.json';
import { debounce } from 'lodash';
import { Row, Col, Button, Navbar, Dropdown, Modal } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faSignOutAlt, faUserFriends, faPlusSquare, faCog, faUserPlus, faUsers, faLock, faCamera } from '@fortawesome/free-solid-svg-icons';
import { getOrganizationUsers } from '../actions/organization';
import EnsureLoggedInContainer from '../containers/EnsureLoggedInContainer';
import LoginPage from '../containers/LoginPage';
import LoadingPage from '../containers/LoadingPage';
import RoomPage from '../containers/RoomPage';
import TeamPage from '../containers/TeamPage';
import ManageUsersModal from './ManageUsersModal';
import InviteUsersModal from './InviteUsersModal';
import ManageCameraModal from './ManageCameraModal';
import RoomsModal from './RoomsModal';


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
        }

        this.handleResize = this.handleResize.bind(this);
    }

    componentDidMount() {
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
    }

    componentDidUpdate() {
        const { getOrganizations, organization } = this.props;
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        var width = window.innerWidth;
        var sidebarWidth = 240;
        var mainContainerWidth = width - sidebarWidth;
        this.setState({ dimensions: { width, height: window.innerHeight, sidebarWidth, mainContainerWidth } });
    }

    render() {
        const { organization, teams, user, auth, userLogout, currentUrl, getOrganizationUsers, organizationUsers, organizationLoading, inviteUsers, inviteUsersSuccess, getAvailableDevices, settings, updateDefaultDevices } = this.props;
        const { dimensions, showInviteUsersModal, showManageUsersModal, showRoomsModal, showManageCameraModal } = this.state;

        teams.forEach(team => {
            if (team.name.length > 20) {
                team.name = team.name.slice(0, 16);
                team.name = team.name.trim() + "...";
            }
        })

        
        if (typeof teams[0] != "undefined" && teams[0].rooms.length == 1) {
            teams[0].rooms.push({
                id: 99,
                name: "Daily Standup"
            })
    
            teams[0].rooms.push({
                id: 100,
                name: "Team Lead Chat"
            })
    
            teams[0].rooms.push({
                id: 101,
                name: "Sprint Planning"
            })

            teams[0].rooms.push({
                id: 102,
                name: "Foodies"
            })
        }

       
        const rooms = teams.map((team, teamKey) =>
            <div key={teamKey} className="mt-2">
                <Row>
                    <Col xs={9}>
                        <p className="text-light pt-1 mb-0 pl-3" style={{fontSize:"1rem",fontWeight:600}}>Rooms</p>
                    </Col>
                    <Col xs={3}>
                        <Button variant="link" style={{color:"#fff",fontSize:".9rem"}} onClick={() => this.setState({ showRoomsModal: true })}><FontAwesomeIcon icon={faPlusSquare} /></Button>
                    </Col>
                </Row>
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
                                <p className="text-light mb-0 pl-3">{room.id == 100 ? <FontAwesomeIcon icon={faLock} style={{fontSize:".65rem"}} /> : '# '} {room.name}</p>
                            </NavLink>
                        </li>
                    )}
                </ul>
            </div>
        )

        var firstRoom = {};
        teams.forEach(team => {
            team.rooms.forEach(room => {
                firstRoom = {
                    slug: room.slug,
                    team: team,
                    room: room
                }
            })
        })

        if (organization != null && organization.name.length > 19) {
            organization.name = organization.name.slice(0, 18);
            organization.name = organization.name.trim() + "...";
        }

        return (
            <>
                <Switch>
                    <Route path={routes.LOGIN} component={LoginPage} />
                    <Route path={routes.LOADING} component={LoadingPage} />
                    <Redirect from="/" exact to={{
                            pathname: routes.LOADING,
                    }} />
                </Switch>
                <Switch>
                <EnsureLoggedInContainer>
                    <InviteUsersModal 
                        show={showInviteUsersModal}
                        handleSubmit={inviteUsers}
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
                        onHide={() => this.setState({ showRoomsModal: false })}
                    />
                    <ManageCameraModal 
                        show={showManageCameraModal}
                        settings={settings}
                        handleSubmit={updateDefaultDevices}
                        onShow={() => getAvailableDevices()}
                        onHide={() => this.setState({ showManageCameraModal: false })}
                    />
                    {typeof firstRoom != "undefined" && typeof firstRoom.slug != "undefined" ?
                        <Redirect from="/redirect" exact to={{
                            pathname: `/room/${firstRoom.slug}`,
                            state: {
                                team: firstRoom.team,
                                room: firstRoom.room
                            }
                        }} />

                        : ""
                    }
                    <div style={{backgroundColor:"#1b1e2f",width:this.state.dimensions.sidebarWidth}} className="vh-100 pr-0 float-left">
                        
                        <Navbar className="text-light pt-4" style={{height:80,backgroundColor:"#121422",borderBottom:"1px solid #1c2046"}}>
                            <Navbar.Brand>
                                {organization != null ? 
                                    <p className="text-light p-0 m-0" style={{fontSize:".9rem"}}><strong>{organization.name}</strong></p>
                                : '' }
                                {user != null ? 
                                    <p className="text-light pt-0 pb-1" style={{fontSize:".8rem"}}>{user.name}</p>
                                : '' }
                            </Navbar.Brand>
                            <div className="ml-auto" style={{height:60}}>
                        
                                <Dropdown className="dropdownSettings text-light">
                                    <Dropdown.Toggle><FontAwesomeIcon icon={faCog} style={{color:"#fff"}} /></Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => this.setState({ showInviteUsersModal: true })}>
                                            <FontAwesomeIcon icon={faUserPlus} /> Invite People to {organization != null ? organization.name : ''}
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => this.setState({ showManageUsersModal: true })}>
                                            <FontAwesomeIcon icon={faUserFriends} /> Manage Team
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
                    <div className="pl-0 ml-auto" style={{borderLeft:"1px solid #1c2046",width:this.state.dimensions.mainContainerWidth}}>
                        <Route 
                            path={routes.ROOM} 
                            render={(routeProps) => (
                                <RoomPage {...routeProps} dimensions={this.state.dimensions} />
                            )}
                        />
                        <Route 
                            path={routes.TEAM} 
                            render={(routeProps) => (
                                <TeamPage {...routeProps} />
                            )}
                        />
                    </div>
                </EnsureLoggedInContainer>
                </Switch>
            </>
        );
    }

}

export default Sidebar;