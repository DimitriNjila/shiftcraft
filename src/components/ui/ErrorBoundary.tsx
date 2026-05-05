import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return { hasError: true, message };
  }

  override componentDidCatch(error: unknown, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div
              className="w-12 h-12 rounded-2xl grid place-items-center mx-auto mb-5"
              style={{ background: "var(--color-tertiary-fixed)", color: "var(--color-tertiary-fixed-dim)" }}
            >
              <span className="text-xl font-bold">!</span>
            </div>
            <h1 className="headline-md mb-2">Something went wrong</h1>
            <p className="body-sm text-on-surface-muted mb-6">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: "" });
                window.location.reload();
              }}
              className="btn btn-secondary py-2.5 text-sm"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
