import { Component } from "react";
import { useNavigate } from "react-router-dom";

function FallbackWithNav() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white font-display flex flex-col items-center justify-center px-6">
      <p className="text-white/90 font-medium mb-2">Something went wrong</p>
      <p className="text-white/60 text-sm text-center mb-6">
        The scanner couldn’t start. Try again or use the map to find a station.
      </p>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="px-6 py-3 rounded-xl bg-white text-black font-bold"
      >
        Close
      </button>
    </div>
  );
}

export class ScanErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ScanErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackWithNav />;
    }
    return this.props.children;
  }
}
