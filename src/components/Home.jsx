import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Image, Button } from 'react-bootstrap';
import routes from '../constants/routes.json';

export default function Home() {
  return (
    <Container data-tid="container" fluid>
      <h1 className="text-center mt-5">Welcome to Water Cooler</h1>
      <center><Button variant="primary"><Link className="mx-auto" to={routes.ROOM}>Open Room</Link></Button></center>
      <Image src="https://watercooler.work/img/water_cooler.png" className="w-100 mx-auto" />
    </Container>
  );
}
