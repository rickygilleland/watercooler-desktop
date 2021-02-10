import React from "react";
import { Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError && this.props.showError) {
      return (
        <Card className="m-3 shadow-sm error-message">
          <Card.Body>
            <h1 className="text-center">Oh no, something went wrong!</h1>
            <p className="text-center" style={{ fontSize: "1rem" }}>
              <span style={{ fontWeight: 600 }}>
                Sorry about that. Try going to another page or restarting Blab.
              </span>
              <br />
              The error has been logged and we're already working to make sure
              it doesn't happen again.
            </p>
          </Card.Body>
        </Card>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
