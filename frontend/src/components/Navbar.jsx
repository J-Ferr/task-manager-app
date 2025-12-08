import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 shadow rounded">

      <h1 className="text-2xl font-bold dark:text-white">Task Manager</h1>

      <div className="flex items-center space-x-3">

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="px-3 py-1 rounded bg-gray-600 text-white"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
