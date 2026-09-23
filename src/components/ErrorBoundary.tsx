import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorScreen } from './ErrorScreen';

interface State {
  failed: boolean;
}

/**
 * The last line of defence under the router. Without it, any exception thrown while
 * rendering - or a lazy route chunk that fails to load after a deploy replaced it -
 * unmounts the whole tree and leaves a blank white page with no way forward. This
 * renders no DOM of its own while nothing has failed, so the prerendered markup and the
 * hydrated tree stay identical.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return <ErrorScreen />;
  }
}
