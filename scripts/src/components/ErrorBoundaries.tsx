import { Alert } from 'antd';
import React, { PropsWithChildren } from 'react';

interface ErrorBoundariesState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundaries extends React.Component<
  PropsWithChildren,
  ErrorBoundariesState
> {
  state: ErrorBoundariesState = {
    hasError: false,
  };
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log('error bb', error, errorInfo);

    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }
  render(): React.ReactNode {
    const { hasError, error, errorInfo } = this.state;
    return hasError ? (
      <div style={{ padding: 20 }}>
        <Alert
          type="warning"
          message={error?.message}
          description={errorInfo?.componentStack}
        />
      </div>
    ) : (
      this.props.children
    );
  }
}
