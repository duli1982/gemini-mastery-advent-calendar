import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './enterprise.css';
import './work.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Application error', error, info.componentStack); }
  render() {
    return this.state.error ? <main className="error-page"><p className="eyebrow">24 DAYS OF SMARTER WORK</p><h1>Let’s try that again.</h1><p>The page could not finish loading. Your previously saved browser progress is still available.</p><button className="button primary" onClick={() => window.location.reload()}>Reload page</button><a href={window.location.pathname}>Return to the track chooser</a></main> : this.props.children;
  }
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App /></ErrorBoundary></React.StrictMode>);
