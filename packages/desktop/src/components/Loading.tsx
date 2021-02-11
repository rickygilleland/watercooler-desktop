import { Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import routes from "../constants/routes.json";

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
    };
  }

  componentDidMount(): void {
    const { getOrganizations, getUserDetails, push, user, auth } = this.props;

    if (auth.isLoggedIn == false) {
      return push("/login");
    }

    getOrganizations();

    if (Object.keys(user).length === 0 || typeof user == "undefined") {
      return getUserDetails();
    }

    if (this.state.redirect === false) {
      this.setState({ redirect: true });
      return push(routes.TEAM);
    }
  }

  componentDidUpdate(): void {
    const {
      organization,
      organizationUsers,
      auth,
      user,
      push,
      getUserDetails,
      getOrganizations,
      getOrganizationUsers,
    } = this.props;

    if (auth.isLoggedIn == false) {
      return push("/login");
    }

    if (Object.keys(user).length === 0 || typeof user == "undefined") {
      return getUserDetails();
    }

    if (
      Object.keys(organization).length === 0 ||
      typeof organization == "undefined"
    ) {
      return getOrganizations();
    }

    if (
      organizationUsers.length == 0 &&
      typeof organization.id != "undefined"
    ) {
      return getOrganizationUsers(organization.id);
    }

    if (this.state.redirect === false) {
      this.setState({ redirect: true });

      return push(routes.TEAM);
    }
  }

  render(): JSX.Element {
    return (
      <Container data-tid="container" fluid>
        <h1 className="text-center mt-5">Loading Blab...</h1>
        <center>
          <FontAwesomeIcon
            icon={faCircleNotch}
            className="mt-3"
            style={{ fontSize: "2.4rem", color: "#6772ef" }}
            spin
          />
        </center>
      </Container>
    );
  }
}

export default Loading;
