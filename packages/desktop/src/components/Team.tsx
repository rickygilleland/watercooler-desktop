/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DateTime } from "luxon";
import {
  Image,
  Button,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faUserPlus,
  faCircle,
  faComment,
} from "@fortawesome/free-solid-svg-icons";
import InviteUsersModal from "./InviteUsersModal";
import posthog from "posthog-js";

interface TeamProps {
  currentTime: any;
  user: any;
  organizationLoading: string;
  inviteUsers: any;
  inviteUsersSuccess: boolean;
  organizationUsersOnline: any;
  billing: any;
  organization: any;
  organizationUsers: any;
  getOrganizationUsers: any;
}

export default function Team(props: TeamProps) {
  const [showInviteUsersModal, setShowInviteUsersModal] = useState(false);

  useEffect(() => {
    posthog.capture("$pageview");

    props.getOrganizationUsers(props.organization.id);
  }, []);

  return (
    <>
      <InviteUsersModal
        show={showInviteUsersModal}
        handleSubmit={props.inviteUsers}
        loading={props.organizationLoading.toString() === "loading" ?? false}
        inviteuserssuccess={props.inviteUsersSuccess}
        organizationusers={props.organizationUsers}
        billing={props.billing}
        onHide={() => this.setState({ showInviteUsersModal: false })}
      />
      <Row className="pl-0 ml-0" style={{ height: 80 }}>
        <Col xs={{ span: 4 }}>
          <div className="d-flex flex-row justify-content-start">
            <div className="align-self-center">
              <p
                style={{ fontWeight: "bolder", fontSize: "1.65rem" }}
                className="pb-0 mb-0"
              >
                Team
                {props.organizationLoading && (
                  <FontAwesomeIcon
                    icon={faCircleNotch}
                    style={{
                      color: "#6772ef",
                      marginLeft: 10,
                      marginTop: -2,
                      verticalAlign: "middle",
                      fontSize: ".8rem",
                    }}
                    spin
                  />
                )}
              </p>
            </div>
            <div style={{ height: 80 }}></div>
          </div>
        </Col>
        <Col xs={{ span: 4, offset: 4 }}>
          <div className="d-flex flex-row justify-content-end">
            <div className="align-self-center pr-4">
              {props.billing.plan == "Free" &&
                props.organizationUsers.length > 4 && (
                  <OverlayTrigger
                    placement="bottom-start"
                    overlay={
                      <Tooltip id="tooltip-team-disabled">
                        Upgrade to invite more teammates.
                      </Tooltip>
                    }
                  >
                    <Button
                      style={{ pointerEvents: "none" }}
                      variant="link"
                      className="icon-button"
                      disabled={
                        props.billing.plan == "Free" &&
                        props.organizationUsers.length > 4
                      }
                    >
                      <FontAwesomeIcon icon={faUserPlus} /> Invite
                    </Button>
                  </OverlayTrigger>
                )}
              {props.billing.plan != "Free" ||
                (props.organizationUsers.length < 5 && (
                  <Button
                    variant="link"
                    className="icon-button"
                    onClick={() =>
                      this.setState({ showInviteUsersModal: true })
                    }
                  >
                    <FontAwesomeIcon icon={faUserPlus} /> Invite
                  </Button>
                ))}
            </div>
            <div style={{ height: 80 }}></div>
          </div>
        </Col>
      </Row>
      {props.organizationLoading && props.organizationUsers.length == 0 ? (
        <>
          <h1 className="text-center mt-5">Loading Team...</h1>

          <FontAwesomeIcon
            icon={faCircleNotch}
            className="mt-3"
            style={{ fontSize: "2.4rem", color: "#6772ef" }}
            spin
          />
        </>
      ) : (
        <Row
          className="pt-3 px-3 team-container"
          style={{ overflowY: "scroll", paddingBottom: 100 }}
        >
          {props.organizationUsers.map((organizationUser) => (
            <Col
              xs={12}
              md={6}
              xl={4}
              key={organizationUser.id}
              className="mb-5"
            >
              <div className="d-flex">
                <div style={{ width: 125 }}>
                  <Image
                    src={organizationUser.avatar_url}
                    fluid
                    style={{ maxHeight: 125, borderRadius: 15 }}
                    className="shadow"
                  />
                </div>
                <div className="ml-3 align-self-center">
                  <p
                    className="font-weight-bold mb-0"
                    style={{ fontSize: ".95rem" }}
                  >
                    {organizationUsersOnline.includes(organizationUser.id) ? (
                      <FontAwesomeIcon
                        icon={faCircle}
                        className="mr-1"
                        style={{
                          color: "#3ecf8e",
                          fontSize: ".5rem",
                          verticalAlign: "middle",
                        }}
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faCircle}
                        className="mr-1"
                        style={{
                          color: "#f9426c",
                          fontSize: ".5rem",
                          verticalAlign: "middle",
                        }}
                      />
                    )}{" "}
                    {organizationUser.first_name} {organizationUser.last_name}{" "}
                    {user.id == organizationUser.id ? "(you)" : ""}
                  </p>
                  {organizationUser.timezone != null ? (
                    <p style={{ fontSize: ".8rem" }}>
                      <strong>Local Time:</strong>{" "}
                      {props.currentTime
                        .setZone(organizationUser.timezone)
                        .toLocaleString(DateTime.TIME_SIMPLE)}
                    </p>
                  ) : (
                    ""
                  )}
                  <Link
                    to={{
                      pathname: `/messages/new`,
                      state: {
                        recipient: organizationUser,
                      },
                    }}
                  >
                    <Button variant="link" className="icon-button" size="lg">
                      <FontAwesomeIcon icon={faComment} />
                    </Button>
                  </Link>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}
