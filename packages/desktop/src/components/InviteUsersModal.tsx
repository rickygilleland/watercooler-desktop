import { Alert, Button, Form, Modal } from "react-bootstrap";
import { Billing } from "../store/types/organization";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "../store/types/user";
import {
  faCircleNotch,
  faUserPlus,
  faWindowClose,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";

interface InviteUsersModalProps {
  handleSubmit: (emails: string) => void;
  onHide: () => void;
  show: boolean;
  inviteuserssuccess: boolean;
  loading: boolean;
  organizationusers: User[];
  billing: Billing;
}

export default function InviteUsersModal(
  props: InviteUsersModalProps,
): JSX.Element {
  const [emails, setEmails] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmails(event.target.value);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setFormSubmitted(true);

    props.handleSubmit(emails);
  }

  function handleHide() {
    setFormSubmitted(false);
    setEmails("");
    props.onHide();
  }

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
        <Modal.Title className="font-weight-bolder">
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" /> Invite Someone
          New
        </Modal.Title>
        <Button
          variant="outline-secondary"
          style={{ borderColor: "transparent" }}
          onClick={() => handleHide()}
        >
          <FontAwesomeIcon icon={faWindowClose}></FontAwesomeIcon>
        </Button>
      </Modal.Header>
      <Modal.Body>
        {props.inviteuserssuccess && formSubmitted && (
          <Alert variant="success" className="text-center">
            Your invites were successfully sent. Let them know to check their
            email to get started with Blab!
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Label>
            Enter the email address of each person you want to invite.
          </Form.Label>
          <Form.Label
            className="mb-4"
            style={{ fontWeight: 500, fontSize: ".9rem" }}
          >
            Feel free to enter multiple addresses, separated by commas.
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={emails}
            onChange={handleEmailChange}
          />
          <Button
            className="mt-3"
            variant="primary"
            type="submit"
            disabled={props.loading}
          >
            <FontAwesomeIcon icon={faCircleNotch} spin />{" "}
            {props.loading ? "Sending Invites" : "Send Invites"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
