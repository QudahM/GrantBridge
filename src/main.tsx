import * as Sentry from "@sentry/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { initGA } from "./lib/analytics";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.MODE === "production" ? 0.1 : 1.0, // Lower sampling in production
    beforeSend(event) {
      // Only log in development
      if (import.meta.env.MODE === "development") {
        console.log(
          "Sentry event captured:",
          event.exception?.values?.[0]?.value || event.message
        );
      }
      return event;
    },
  });
} else {
  console.log("Sentry DSN not found, skipping Sentry initialization");
}

initGA();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
