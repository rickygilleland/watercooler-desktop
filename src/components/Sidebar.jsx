import React from 'react';
import { Switch, Route, NavLink } from 'react-router-dom';
import routes from '../constants/routes.json';
import { each, debounce } from 'lodash';
import { Row, Col, Button, Navbar, Dropdown } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faSignOutAlt, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import EnsureLoggedInContainer from '../containers/EnsureLoggedInContainer';
import LoginPage from '../containers/LoginPage';
import HomePage from '../containers/HomePage';
import RoomPage from '../containers/RoomPage';

class Sidebar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            dimensions: {
                width: 0,
                height: 0
            }
        }

        this.handleResize = this.handleResize.bind(this);
        this.handleResize = debounce(this.handleResize, 125);
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
        var sidebarWidth = 255;
        var mainContainerWidth = width - sidebarWidth;
        this.setState({ dimensions: { width, height: window.innerHeight, sidebarWidth, mainContainerWidth } });
    }

    render() {
        const { organization, teams, user, userLogout, } = this.props;
        const { dimensions } = this.state;

        const rooms = teams.map((team, teamKey) =>
            <div key={teamKey}>
                <h3 className="font-weight-bold h4 text-light pl-2 pt-3">{team.name} <small>Rooms</small></h3>
                <hr/>
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

        return (
            <>
                <Switch>
                    <Route path={routes.LOGIN} component={LoginPage} />
                </Switch>
                <Switch>
                <EnsureLoggedInContainer>
              
                        <div style={{backgroundColor:"#1b1e2f",width:this.state.dimensions.sidebarWidth}} className="vh-100 pr-0 float-left">
                            
                            <Navbar className="text-light pt-4" style={{height:80,backgroundColor:"#121422",borderBottom:"2px solid #232533"}}>
                                <Navbar.Brand>
                                    {organization != null ? 
                                        <p className="text-light p-0 m-0" style={{fontSize:"1rem"}}><strong>{organization.name}</strong></p>
                                    : '' }
                                    {user != null ? 
                                        <p className="text-light pt-0 pb-1" style={{fontSize:".9rem"}}>{user.name}</p>
                                    : '' }
                                </Navbar.Brand>
                            </Navbar>
                            <div>
                                {rooms}
                            </div>
                        </div>
                        <div className="pl-0 float-left" style={{borderLeft:"1px solid #232533",width:this.state.dimensions.mainContainerWidth}}>
                            <Route exact path={routes.HOME} component={HomePage} />
                            {/*<Route path={routes.ROOM} component={RoomPage} />*/}
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