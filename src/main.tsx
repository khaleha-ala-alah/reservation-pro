import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/fullcalendar/core.css";
import "./styles/fullcalendar/daygrid.css";
import "./styles/fullcalendar/timegrid.css";
import "@fontsource-variable/inter"; 

import "./index.css";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
