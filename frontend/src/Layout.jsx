import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

export default function Layout() {
  return (
    <>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <Outlet />
      </div>
    </>
  );
}

