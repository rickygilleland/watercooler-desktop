import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { Container, Image, Button, Card, CardColumns, Navbar, Row, Col, OverlayTrigger, Overlay, Popover, Tooltip } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faUserPlus, faCircle } from '@fortawesome/free-solid-svg-icons';
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
        const { currentTime, user, organizationLoading, inviteUsers, inviteUsersSuccess, organizationUsersOnline } = this.props;
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
                        {organizationUsers.map((organizationUser) =>
                            <Col xs={6} md={4} lg={3} xl={2} key={organizationUser.id}>
                                <Card className="mb-3">
                                    <Card.Img variant="top" src={organizationUser.avatar_url} className="border-bottom" />
                                    <Card.Body style={{padding:".7rem"}}>
                                        <p className="font-weight-bold mb-0" style={{fontSize:".95rem"}}>
                                        {organizationUsersOnline.includes(organizationUser.id) ? <FontAwesomeIcon icon={faCircle} className="mr-1" style={{color:"#3ecf8e",fontSize:".5rem",verticalAlign:'middle'}} /> : <FontAwesomeIcon icon={faCircle} className="mr-1" style={{color:"#f9426c",fontSize:".5rem",verticalAlign:'middle'}} />} {organizationUser.first_name} {organizationUser.last_name} {user.id == organizationUser.id ? "(you)" : ''}
                                        </p>
                                        {organizationUser.timezone != null ?
                                            <p style={{fontSize:".8rem"}}><strong>Local Time:</strong> {currentTime.setZone(organizationUser.timezone).toLocaleString(DateTime.TIME_SIMPLE)}</p>
                                        : '' }
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
