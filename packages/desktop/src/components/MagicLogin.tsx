import { Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import routes from "../constants/routes.json";

class MagicLogin extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(): void {
    const { auth, match, push, authenticateUserMagicLink } = this.props;

    if (auth.isLoggedIn === true) {
      push(routes.LOADING);
    }

    authenticateUserMagicLink(match.params.code);
  }

  componentDidUpdate(prevProps, prevState): void {
    const { auth, push } = this.props;

    if (auth.isLoggedIn === true) {
      push(routes.LOADING);
    }

    if (auth.loginError) {
      push(routes.LOGIN);
    }
  }

  render(): JSX.Element {
    return (
      <Container data-tid="container" fluid>
        <h1 className="text-center mt-5">Logging you in...</h1>
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

export default MagicLogin;
