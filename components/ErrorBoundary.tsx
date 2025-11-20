import React, { Component, ErrorInfo, ReactNode } from 'react';
import { analytics } from '../utils/analytics';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to analytics if available
    console.error('Error boundary caught an error:', error, errorInfo);

    // Track error in analytics
    analytics.trackApiError('ErrorBoundary', `${error.name}: ${error.message}`);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    // Clear error state and reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI when error occurs
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-red-500/30 p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-bold text-center text-red-400 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-300 text-center mb-6">
              The advent calendar encountered an unexpected error. Don't worry - your progress is saved!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reload Page
              </button>
              <a
                href="/"
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Go to Home
              </a>
            </div>

            {/* Technical Details (collapsed by default) */}
            {this.state.error && (
              <details className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <summary className="cursor-pointer text-gray-400 hover:text-gray-300 font-semibold mb-2">
                  Technical Details (for support)
                </summary>
                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-red-400 font-mono text-sm">
                      {this.state.error.toString()}
                    </p>
                  </div>
                  {this.state.errorInfo && (
                    <div className="mt-2">
                      <p className="text-gray-500 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </p>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Footer Message */}
            <p className="text-center text-gray-500 text-sm mt-6">
              If this problem persists, please contact support with the technical details above.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
