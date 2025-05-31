import React from 'react';

import { isDevelopment, isTest } from '../constants';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    if (isDevelopment || isTest) {
      console.log(error);
    }

    return { hasError: true };
  }

  componentDidCatch(error: Error, info: any) {
    if (isDevelopment || isTest) {
      console.info(info);
      console.error(error);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
