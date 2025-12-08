import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import { RouterProvider } from "react-router-dom";
import router from "./routes";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

