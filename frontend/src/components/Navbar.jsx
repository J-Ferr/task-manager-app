import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center mb-6 bg-white p-4 shadow rounded">
      <h1 className="text-2xl font-bold">Task Manager</h1>

      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        Logout
      </button>
    </nav>
  );
}
