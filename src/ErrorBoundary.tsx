import React from "react";

type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<{children: React.ReactNode}, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("🔥 App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Une erreur est survenue.</h1>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f9fafb", padding: 12, borderRadius: 8 }}>
            {String(this.state.error?.message || this.state.error || "")}
          </pre>
          <p style={{ marginTop: 8, color: "#6b7280" }}>Ouvrez la console (F12) pour plus de détails.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
