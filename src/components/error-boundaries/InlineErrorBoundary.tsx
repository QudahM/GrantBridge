import { AlertCircle } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Lightweight error boundary for inline components
 * Shows a compact error message instead of crashing the whole page
 */
class InlineErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `InlineErrorBoundary (${
        this.props.componentName || "Unknown"
      }) caught an error:`,
      error,
      errorInfo
    );

    // TODO: Send to error tracking service
    // Sentry.captureException(error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="text-red-400 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <p className="text-sm font-semibold text-red-300">
                {this.props.componentName
                  ? `Error loading ${this.props.componentName}`
                  : "Something went wrong"}
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <p className="text-xs text-red-400 mt-1 font-mono">
                  {this.state.error.message}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default InlineErrorBoundary;
