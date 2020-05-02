import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import { Container, Image, Button, Card, CardColumns, Navbar, Row, Col } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import InviteUsersModal from './InviteUsersModal';

class Team extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showInviteUsersModal: false
        };
    }

    componentDidMount() {
        const { getOrganizationUsers, organization } = this.props;

        getOrganizationUsers(organization.id);
    }

    componentDidUpdate() {
    
    }

    render() {
        const { organizationLoading, inviteUsers, inviteUsersSuccess } = this.props;
        var { organizationUsers } = this.props;
        const { showInviteUsersModal } = this.state;

        return(
            <>
                <InviteUsersModal 
                    show={showInviteUsersModal}
                    handleSubmit={inviteUsers}
                    inviteuserssuccess={inviteUsersSuccess}
                    onHide={() => this.setState({ showInviteUsersModal: false })}
                />
                <Row className="text-light pl-0 ml-0" style={{height:80,backgroundColor:"#121422"}}>
                    <Col xs={{span:4}}>
                        <div className="d-flex flex-row justify-content-start">
                            <div className="align-self-center">
                                <p style={{fontWeight:"bolder",fontSize:"1rem"}} className="pb-0 mb-0">Team</p>
                            </div>
                            <div style={{height:80}}></div>
                        </div>
                    </Col>
                    <Col xs={{span:4,offset:4}}>
                        <div className="d-flex flex-row justify-content-end">
                            <div className="align-self-center pr-4">
                                <Button variant="success" onClick={() => this.setState({ showInviteUsersModal: true })}><FontAwesomeIcon icon={faUserPlus} /> Invite</Button>
                            </div>
                            <div style={{height:80}}></div>
                        </div>
                    </Col>
                </Row>
                {organizationLoading ?
                     <>
                        <h1 className="text-center mt-5">Loading Team...</h1>
                        <center><FontAwesomeIcon icon={faCircleNotch} className="mt-3" style={{fontSize:"2.4rem",color:"#6772ef"}} spin /></center> 
                    </>
                :   
                    <Row className="pt-3 px-3 vh-100" style={{overflowY:"scroll",paddingBottom:100}}>
                        {organizationUsers.map((user) =>
                            <Col xs={6} md={4} lg={3} key={user.id}>
                                <Card className="mb-3">
                                    <Card.Img variant="top" src={user.avatar_url} className="border-bottom" />
                                    <Card.Body>
                                        <p className="font-weight-bold" style={{fontSize:"1rem"}}>{user.first_name} {user.last_name}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}
                    </Row>
                }
            </>
        )
    }

}

export default Team;
