import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you'd send this to an error-tracking service (e.g. Sentry)
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[ErrorBoundary]", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="page-shell flex min-h-[60vh] items-center justify-center py-20">
          <div className="text-center">
            <p className="eyebrow-chip mb-3">Something went wrong</p>
            <h1 className="heading-h2 mb-3 text-gray-900">Unexpected Error</h1>
            <p className="mx-auto mb-8 max-w-md text-sm text-gray-500">
              An unexpected error occurred. Please refresh the page or try again
              later.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Refresh Page
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
