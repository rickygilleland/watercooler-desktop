import React, { useState } from 'react';

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
        // You can render any custom fallback UI
        return <h1 className="text-center">Oops! Something went wrong. Try restarting Water Cooler</h1>;
      }
      return this.props.children;
    }
}

export default ErrorBoundary;