import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Navbar, Row } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faSignOutAlt, faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import routes from '../constants/routes.json';
import Peer from 'peerjs';


class Room extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            room: {},
            team: {},
            loading: true
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
        
        var peer = new Peer({
            host: "peer.watercooler.work",
            port: 443,
            secure: true,
            path: "/peer"
        });

        console.log(peer);

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
        const { team, room, loading } = this.state;
        return (
            <React.Fragment>
                <Navbar bg="dark" className="text-light pt-3" expand="lg">
                    <Navbar.Brand>
                        <p className="text-light p-0 m-0"><strong>{team.name} / {room.name}</strong></p>
                    </Navbar.Brand>
                </Navbar>
                {loading ? 
                    <React.Fragment>
                        <h1 className="text-center mt-5">Loading...</h1>
                        <center><FontAwesomeIcon icon={faCircleNotch} className="mt-3" style={{fontSize:"2.4rem",color:"#6772ef"}} spin /></center> 
                    </React.Fragment>  
                : '' }
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
