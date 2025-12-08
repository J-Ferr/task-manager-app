import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
  const { logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center bg-gray-800 dark:bg-gray-900 text-white p-4 shadow mb-6">

      <h1
        onClick={() => navigate("/")}
        className="text-2xl font-bold cursor-pointer"
      >
        Task Manager
      </h1>

      <div className="flex items-center space-x-4">

        <button
          onClick={toggleTheme}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <button
          onClick={() => {
            logout();
            toast.success("Logged out");
            navigate("/login");
          }}
          className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

