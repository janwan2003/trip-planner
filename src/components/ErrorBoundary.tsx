import { Component, ErrorInfo, ReactNode } from 'react';

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

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-display font-semibold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-4">
            This page hit an error. Your saved dates are safe on the server; reloading
            usually fixes it.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
