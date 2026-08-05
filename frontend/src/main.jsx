import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthProvider";
import { CompareProvider } from './context/CompareProvider';   // path fixed

// Ensure you have this in your .env file
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Wrap the app to enable Google OAuth anywhere inside */}
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <CompareProvider>
          <App />
          </CompareProvider>
        </AuthProvider>
        
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);