import { Card } from "react-bootstrap";
import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  showError: boolean;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  State
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Display fallback UI
    this.setState({ hasError: true });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    if (this.state.hasError && this.props.showError) {
      return (
        <Card className="m-3 shadow-sm error-message">
          <Card.Body>
            <h1 className="text-center">Oh no, something went wrong!</h1>
            <p className="text-center" style={{ fontSize: "1rem" }}>
              <span style={{ fontWeight: 600 }}>
                Sorry about that :( Try going to another page or restarting
                Blab.
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
