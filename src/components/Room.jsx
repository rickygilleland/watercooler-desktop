import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Navbar, Row } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import routes from '../constants/routes.json';


class Room extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            room: {},
            team: {}
        }
    }

    componentDidMount() {

       this.getCurTeamRoom();
    }

    componentDidUpdate(prevProps, prevState) {
        const { room, team } = this.state;

        if (prevState.room != room && prevState.team != team) {
            this.getCurTeamRoom();
        }
    }

    getCurTeamRoom() {
        const { organization, teams, match, location } = this.props;

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

        this.setState({ room: curRoom, team: curTeam });
    }

    render() {
        const { organization } = this.props;
        const { team, room } = this.state;
        return (
            <React.Fragment>
            <Navbar bg="dark" className="text-light pt-3" expand="lg">
                <Navbar.Brand>
                    <p className="text-light p-0 m-0"><strong>{team.name} / {room.name}</strong></p>
                </Navbar.Brand>
            </Navbar>
            <div className="fixed-bottom bg-dark py-2">
                <Row className="justify-content-md-center">
                    <Button variant="light"><FontAwesomeIcon icon={faMicrophone} /></Button>
                    <Button variant="light" className="mx-3"><FontAwesomeIcon icon={faVideo} /></Button>
                    <Link to={routes.HOME}><Button variant="danger"><FontAwesomeIcon icon={faSignOutAlt} /></Button></Link>
                </Row>
            </div>
            </React.Fragment>
        );
    }
}

export default Room;
