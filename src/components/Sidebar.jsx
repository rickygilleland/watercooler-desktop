import React from 'react';
import { Switch, Route, NavLink, Redirect } from 'react-router-dom';
import routes from '../constants/routes.json';
import { debounce } from 'lodash';
import { Row, Col, Button, Navbar, Dropdown, Modal } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faSignOutAlt, faUserFriends, faPlusSquare, faCog } from '@fortawesome/free-solid-svg-icons';
import EnsureLoggedInContainer from '../containers/EnsureLoggedInContainer';
import LoginPage from '../containers/LoginPage';
import LoadingPage from '../containers/LoadingPage';
import RoomPage from '../containers/RoomPage';
import UsersModal from './UsersModal';
import RoomsModal from './RoomsModal';

class Sidebar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            dimensions: {
                width: 0,
                height: 0
            },
            showUsersModal: false,
            showRoomsModal: false,
        }

        this.handleResize = this.handleResize.bind(this);
        this.handleResize = debounce(this.handleResize, 100);
    }

    componentDidMount() {
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
    }

    componentDidUpdate() {
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
        const { organization, teams, user, auth, userLogout, currentUrl } = this.props;
        const { dimensions, showUsersModal, showRoomsModal } = this.state;

        const rooms = teams.map((team, teamKey) =>
            <div key={teamKey}>
                <Row>
                    <Col xs={6}>
                        <p className="font-weight-bold text-light pt-1 mb-0" style={{fontSize:"1.2rem",paddingLeft:"1.3rem"}}><small>Rooms</small></p>
                    </Col>
                    <Col xs={6}>
                        <p className="text-right text-light pr-2 pt-1 mb-0" style={{fontSize:"1.2rem"}}><Button variant="link" style={{color:"#fff"}} onClick={() => this.setState({ showRoomsModal: true })}><FontAwesomeIcon icon={faPlusSquare} /></Button></p>
                    </Col>
                </Row>
                <ul className="nav flex-column">
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
                                <strong className="pl-2 text-light"># {room.name}</strong>
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

        return (
            <>
                <UsersModal 
                    show={showUsersModal}
                    onHide={() => this.setState({ showUsersModal: false })}
                />
                <RoomsModal 
                    show={showRoomsModal}
                    onHide={() => this.setState({ showRoomsModal: false })}
                />
                <Switch>
                    <Route path={routes.LOGIN} component={LoginPage} />
                    <Route path={routes.LOADING} component={LoadingPage} />
                    <Redirect from="/" exact to={{
                            pathname: routes.LOADING,
                    }} />
                </Switch>
                <Switch>
                <EnsureLoggedInContainer>
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
                                    <p className="text-light p-0 m-0" style={{fontSize:"1rem"}}><strong>{organization.name}</strong></p>
                                : '' }
                                {user != null ? 
                                    <p className="text-light pt-0 pb-1" style={{fontSize:".9rem"}}>{user.name}</p>
                                : '' }
                            </Navbar.Brand>
                            <div className="ml-auto" style={{height:60}}>
                        
                                <Dropdown className="dropdownSettings text-light">
                                    <Dropdown.Toggle><FontAwesomeIcon icon={faCog} style={{color:"#fff"}} /></Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => this.setState({ showUsersModal: true })}>
                                            <FontAwesomeIcon icon={faUserFriends} /> Manage Users
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => userLogout() }>
                                            <FontAwesomeIcon icon={faSignOutAlt}/> Sign Out
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                            </div>
                        </Navbar>
                        <div>
                            {rooms}
                        </div>
                    </div>
                    <div className="pl-0 float-left" style={{borderLeft:"1px solid #1c2046",width:this.state.dimensions.mainContainerWidth}}>
                        <Route 
                            path={routes.ROOM} 
                            render={(routeProps) => (
                                <RoomPage {...routeProps} dimensions={this.state.dimensions} />
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