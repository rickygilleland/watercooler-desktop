import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Image, Button } from 'react-bootstrap';
import routes from '../constants/routes.json';

class Home extends React.Component {

    componentDidMount() {
        const { getRooms } = this.props;
        getRooms();
    }

    componentDidUpdate() {
        const { rooms } = this.props;
        console.log(rooms);
    }

    render() {
        return(
            <Container data-tid="container" fluid>
                <h1 className="text-center mt-5">Welcome to Water Cooler</h1>
                <center><Link className="mx-auto" to={routes.ROOM}><Button variant="primary">Open Room</Button></Link></center>
                <Image src="https://watercooler.work/img/water_cooler.png" className="w-100 mx-auto" />
            </Container>
        )
    }

}

export default Home;

