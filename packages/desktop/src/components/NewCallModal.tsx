import {
  Alert,
  Button,
  Col,
  Form,
  Modal,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faWindowClose,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import Select from "react-select";

function NewCallModal(props) {
  const { userId, users } = props;
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [reset, setReset] = useState(false);

  if (
    props.roomsModalReset &&
    ((formSubmitted == true && reset == true) ||
      (props.createroomsuccess && reset == false))
  ) {
    setFormSubmitted(false);
    setReset(true);
  }

  function handleSelectedUsersChange(selectedOptions) {
    if (selectedOptions != null) {
      const updatedSelectedUsers = selectedOptions.map((option) => {
        return option.value;
      });

      return setSelectedUsers(updatedSelectedUsers);
    }

    setSelectedUsers([]);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormSubmitted(true);
    props.handleSubmit(selectedUsers);
  }

  function handleHide() {
    setFormSubmitted(false);
    setReset(false);
    props.onHide();
  }

  const filteredUsers = users.filter((user) => {
    return user.id != userId;
  });

  const options = filteredUsers.map((user) => {
    return {
      value: user.id,
      label: `${user.first_name} ${user.last_name}`,
    };
  });

  const selectStyles = {
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? "blue" : "black",
    }),
    control: (provided) => ({
      ...provided,
    }),
  };

  return (
    <Modal
      show={props.show}
      onHide={handleHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      scrollable={true}
    >
      <Modal.Header>
        <Modal.Title className="font-weight-bolder">Start a Call</Modal.Title>
        <Button
          variant="outline-secondary"
          style={{ borderColor: "transparent" }}
          onClick={() => handleHide()}
        >
          <FontAwesomeIcon icon={faWindowClose}></FontAwesomeIcon>
        </Button>
      </Modal.Header>
      <Modal.Body className="mt-0 pt-0">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col xs={9}>
              <Select
                options={options}
                isClearable={true}
                isSearchable={true}
                styles={selectStyles}
                placeholder="Select someone to start a call"
                onChange={handleSelectedUsersChange}
                name="participants"
                isMulti
              />
            </Col>
            <Col xs={3}>
              {props.loading == "true" ? (
                <Button
                  className="btn-block"
                  variant="primary"
                  type="submit"
                  disabled
                >
                  <FontAwesomeIcon icon={faCircleNotch} spin /> Starting Call
                </Button>
              ) : (
                <Button className="btn-block" variant="primary" type="submit">
                  Start Call
                </Button>
              )}
            </Col>
          </Row>
        </Form>

        <div className="mt-5 vh-100">
          <h5>Recent Calls</h5>
          <p>No recent calls.</p>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default NewCallModal;
