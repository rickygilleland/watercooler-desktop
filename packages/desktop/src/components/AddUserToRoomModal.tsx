import React, { useState } from 'react';
import { Row, Col, Button, Navbar, Dropdown, Modal, Card, Image } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCircleNotch, faWindowClose, faCheck } from '@fortawesome/free-solid-svg-icons';

function AddUserToRoomModal(props) {
    const { loading, addUserLoading, users, room, me, organizationUsers, getRoomUsers } = props;

    const [ showAddUserForm, setShowAddUserForm ] = useState(false);
    const [ loadingUser, setLoadingUser ] = useState(null);
    const [ filteredUsers, setFilteredUsers ] = useState([])
    const [ usersAdded, setUsersAdded ] = useState([]);

    function addUser(userId) {
        setLoadingUser(userId);
        
        var updatedUsersAdded = [];

        usersAdded.forEach(user => {
            updatedUsersAdded.push(user);
        })

        updatedUsersAdded.push(userId);

        setUsersAdded(updatedUsersAdded);

        props.handleSubmit(room.id, userId);
    }

    function handleHide() {
        setShowAddUserForm(false);
        setFilteredUsers([]);
        setUsersAdded([]);
        getRoomUsers(room.id);
        props.onHide();
    }

    function filterCurrentUsers() {
        var usersToInvite = [];

        organizationUsers.forEach(filterUser => {
            var found = false;
            users.forEach(roomUser => {
                if (roomUser.id == filterUser.id) {
                    return found = true;
                }
            })

            filterUser.in_room = found;

            usersToInvite.push(filterUser);
        });

        setFilteredUsers(usersToInvite);
        setShowAddUserForm(true);
    }

    return (
      <Modal
        show={props.show}
        onHide={handleHide}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        scrollable={true}
      >
        <Modal.Header>
          <Modal.Title className="font-weight-bolder">
            Members
          </Modal.Title>
          <Button variant="outline-secondary" style={{borderColor:"transparent"}} onClick={() => props.onHide()}><FontAwesomeIcon icon={faWindowClose}></FontAwesomeIcon></Button>
        </Modal.Header>
        <Modal.Body>
        {loading == "true" ?
            <>
                <h1 className="text-center h5">Loading...</h1>
                <center><FontAwesomeIcon icon={faCircleNotch} className="mt-3" style={{fontSize:"2.4rem",color:"#6772ef"}} spin /></center> 
            </>
        : 

          !showAddUserForm ?
            <>
                {users.map((user) =>
                    <div key={user.id}>
                        <div className="align-items-center d-flex">
                            <Image src={user.avatar_url} fluid roundedCircle style={{maxHeight:30}} className="pr-2" />
                            <p className="text-left align-self-center" style={{fontWeight:600,paddingTop:14,fontSize:"1rem"}}>{user.first_name} {user.last_name} {user.id == me.id ? "(you)" : '' }</p>
                        </div>
                    </div>
                )}
            </>
        : 

            filteredUsers.map((user) =>
                <div key={user.id}>
                    <div className="align-items-center d-flex">
                        <Image src={user.avatar_url} fluid roundedCircle style={{maxHeight:30}} className="pr-2" />
                        <p className="text-left align-self-center" style={{fontWeight:600,paddingTop:14,fontSize:"1rem"}}>{user.first_name} {user.last_name} {user.id == me.id ? "(you)" : '' }</p>
                        {addUserLoading ?
                            loadingUser == user.id ?
                                <Button size="sm" className="ml-auto" disabled><FontAwesomeIcon icon={faCircleNotch} spin /> Adding to Room</Button>
                            :
                                user.in_room || usersAdded.includes(user.id) ?
                                    <Button size="sm" className="ml-auto" disabled>{usersAdded.includes(user.id) ? <><FontAwesomeIcon icon={faCheck} style={{color:'#3ecf8e'}} /> Added to the Room</> : 'Already in this Room'}</Button>
                                :
                                    <Button size="sm" className="ml-auto" disabled>Add to Room</Button>
                        :
                            user.in_room || usersAdded.includes(user.id) ? 
                                <Button size="sm" disabled className="ml-auto">{usersAdded.includes(user.id) ? <><FontAwesomeIcon icon={faCheck} style={{color:'#3ecf8e'}} /> Added to the Room</> : 'Already in this Room'}</Button>
                            :
                                <Button size="sm" className="ml-auto" onClick={() => addUser(user.id)}>Add to Room</Button>
                        }
                    </div>
                </div>
            )
        
        }
         
        </Modal.Body>
        <Modal.Footer style={{justifyContent:'flex-start'}}>
            {!showAddUserForm ? 
                <Button size="md" variant="outline-light" onClick={() => filterCurrentUsers()}>Add People</Button>
            : 
                <Button size="md" variant="outline-light" onClick={() => setShowAddUserForm(false)}>Show Current Members</Button>
            }
        </Modal.Footer>
      </Modal>
    );
}

export default AddUserToRoomModal;