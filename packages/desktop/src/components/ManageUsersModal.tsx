import { Button, Col, Image, Modal, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "../store/types/user";
import { faWindowClose } from "@fortawesome/free-solid-svg-icons";
import CenteredLoadingSpinner from "./CenteredLoadingSpinner";
import React from "react";

interface ManageUsersModalProps {
  loading: boolean;
  users: User[];
  show: boolean;
  onShow(): void;
  onHide(): void;
}

function ManageUsersModal(props: ManageUsersModalProps): JSX.Element {
  const { loading, users } = props;

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      scrollable={true}
    >
      <Modal.Header>
        <Modal.Title className="font-weight-bolder">Manage Team</Modal.Title>
        <Button
          variant="outline-secondary"
          style={{ borderColor: "transparent" }}
          onClick={() => props.onHide()}
        >
          <FontAwesomeIcon icon={faWindowClose}></FontAwesomeIcon>
        </Button>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <>
            <h1 className="text-center h5">Loading Team...</h1>
            <CenteredLoadingSpinner />
          </>
        )}
        {!loading &&
          users.map((user) => (
            <div key={user.id}>
              <Row className="align-items-center justify-content-center">
                <Col xs={2} className="pr-0">
                  <Image
                    src={user.avatar_url}
                    fluid
                    roundedCircle
                    style={{ maxHeight: 40 }}
                  />
                </Col>
                <Col xs={4} className="pl-0">
                  <p className="text-left" style={{ fontWeight: 600 }}>
                    {user.first_name} {user.last_name}
                  </p>
                </Col>
                <Col xs={{ span: 4, offset: 2 }}>
                  <Button size="sm">Manage User</Button>
                </Col>
              </Row>
            </div>
          ))}
      </Modal.Body>
    </Modal>
  );
}

export default ManageUsersModal;
