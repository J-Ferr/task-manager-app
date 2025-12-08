import { createBrowserRouter } from "react-router-dom";

import Layout from "./Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

const router = createBrowserRouter([
  // Login + Register (no navbar)
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  // Protected routes with Navbar
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
    ],
  },
]);

export default router;
