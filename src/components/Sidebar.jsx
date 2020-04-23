import React from 'react';
import { Switch, Route, NavLink } from 'react-router-dom';
import routes from '../constants/routes.json';
import { Row, Col, Button, Table, Navbar } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faSignOutAlt, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import EnsureLoggedInContainer from '../containers/EnsureLoggedInContainer';
import LoginPage from '../containers/LoginPage';
import HomePage from '../containers/HomePage';
import RoomPage from '../containers/RoomPage';

class Sidebar extends React.Component {

    componentDidMount() {
    }

    componentDidUpdate() {
    }

    render() {
        const { organization, teams, user, userLogout, } = this.props;

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
                    <Row>
                        <Col xs={3} md={3} lg={2} style={{borderRight:"1px solid #555f69",backgroundColor:"#3c434a"}} className="vh-100 pr-0">
                            
                            <Navbar bg="dark" className="text-light pt-5" style={{height:80}}>
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
                        </Col>
                        <Col xs={9} md={9} lg={10} className="pl-0">
                            <Route exact path={routes.HOME} component={HomePage} />
                            <Route path={routes.ROOM} component={RoomPage} />
                        </Col>
                    </Row>
                </EnsureLoggedInContainer>
                </Switch>
            </>
        );
    }

}

export default Sidebar;