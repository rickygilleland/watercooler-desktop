import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { Container, Image, Button, Card, CardColumns, Navbar, Row, Col, OverlayTrigger, Overlay, Popover, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faUserPlus, faCircle, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import InviteUsersModal from './InviteUsersModal';

import posthog from 'posthog-js';

class Team extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showInviteUsersModal: false
        };
    }

    componentDidMount() {
        const { getOrganizationUsers, organization } = this.props;

        posthog.capture('$pageview');

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
                    loading={organizationLoading.toString()}
                    inviteuserssuccess={inviteUsersSuccess}
                    onHide={() => this.setState({ showInviteUsersModal: false })}
                />
                <Row className="pl-0 ml-0" style={{height:80}}>
                    <Col xs={{span:4}}>
                        <div className="d-flex flex-row justify-content-start">
                            <div className="align-self-center">
                                <p style={{fontWeight:"bolder",fontSize:"1.65rem"}} className="pb-0 mb-0">Team</p>
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
                    <Row className="pt-3 px-3 team-container" style={{overflowY:"scroll",paddingBottom:100}}>
                        {organizationUsers.map((organizationUser) =>
                            <Col xs={12} md={6} lg={4} xl={3} key={organizationUser.id} className="mb-5">
                                <div className="d-flex">
                                    <div>
                                        <Image src={organizationUser.avatar_url} fluid style={{height:125,borderRadius:15}} className="shadow" />
                                    </div>
                                    <div className="ml-3 align-self-center">
                                        <p className="font-weight-bold mb-0" style={{fontSize:".95rem"}}>
                                            {organizationUsersOnline.includes(organizationUser.id) ? <FontAwesomeIcon icon={faCircle} className="mr-1" style={{color:"#3ecf8e",fontSize:".5rem",verticalAlign:'middle'}} /> : <FontAwesomeIcon icon={faCircle} className="mr-1" style={{color:"#f9426c",fontSize:".5rem",verticalAlign:'middle'}} />} {organizationUser.first_name} {organizationUser.last_name} {user.id == organizationUser.id ? "(you)" : ''}
                                        </p>
                                        {organizationUser.timezone != null ?
                                            <p style={{fontSize:".8rem"}}><strong>Local Time:</strong> {currentTime.setZone(organizationUser.timezone).toLocaleString(DateTime.TIME_SIMPLE)}</p>
                                        : '' }
                                        <Link 
                                            to={{
                                                pathname: `/messages/new`,
                                                state: {
                                                    recipient: organizationUser,
                                                }
                                            }}
                                        >
                                            <Button variant="success"><FontAwesomeIcon icon={faEnvelope} /></Button>
                                        </Link>
                                    </div>
                                </div>
                            </Col>
                        )}
                    </Row>
                }
            </>
        )
    }

}

export default Team;
