import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Card, Navbar, Table } from 'react-bootstrap';
import routes from '../constants/routes.json';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faSignOutAlt, faDoorOpen } from '@fortawesome/free-solid-svg-icons';

class Home extends React.Component {

    componentDidMount() {
        const { getRooms, auth } = this.props;
        getRooms();
    }

    componentDidUpdate() {
        const { organization, teams } = this.props;
    }

    render() {
        const { organization, teams, userLogout } = this.props;
        if (!organization) {
            return(
                <Container data-tid="container" fluid>
                    <h1 className="text-center mt-5">Loading rooms...</h1>
                    <center><FontAwesomeIcon icon={faCircleNotch} className="mt-3" style={{fontSize:"2.4rem",color:"#6772ef"}} spin /></center>
                </Container>
            )
        }
        const items = teams.map((item, key) =>
            <Card className="mb-3 shadow-sm border-0" body key={item.id}>
                <h1 className="h3 mb-4"><strong>{item.name}</strong> Rooms</h1>
                <Table striped>
                    <tbody>
                        {item.rooms.map((roomItem, roomKey) => 
                            <tr key={roomKey}>
                                <td><strong>{roomItem.name}</strong></td>
                                <td className="d-flex flex-row-reverse">
                                    <Link to={{
                                            pathname: `/room/${roomItem.slug}`,
                                            state: {
                                                team: item,
                                                room: roomItem
                                            }
                                        }}>
                                        <Button variant="success"><FontAwesomeIcon icon={faDoorOpen} className="mr-2" />Enter Room</Button>
                                    </Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>
        );
        return(
            <React.Fragment>
                <Navbar className="bg-white mb-4 shadow-sm pt-4" expand="lg">
                    <Navbar.Brand>
                        <img
                            src="https://watercooler.work/img/water_cooler.png"
                            height="40"
                            className="d-inline-block align-top"
                        />
                        <span style={{fontWeight:900,fontSize:"1.5rem",color:"#408af8"}}>Water Cooler</span>
                    </Navbar.Brand>
                    <Button variant="secondary" onClick={() => userLogout() } className="ml-auto"><FontAwesomeIcon icon={faSignOutAlt} /></Button>
                </Navbar>
                <Container data-tid="container" fluid>
                    <Card className="mb-3 shadow-sm border-0" body>
                        <h1 className="h3">
                            <strong>{organization.name}</strong> Teams</h1>
                    </Card>
                    {items}
                </Container>
            </React.Fragment>
        )
    }

}

export default Home;

