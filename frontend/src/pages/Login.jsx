import { useState, useContext } from "react";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosClient.post("/auth/login", {
        email,
        password,
      });

      toast.success("Welcome back!");

      // Update AuthContext properly
      login(response.data.token);

      navigate("/");
    } catch (error) {
      const message =
        error?.response?.data?.message || "Invalid login credentials.";
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="bg-blue-500 text-white py-2 w-full rounded">
          Login
        </button>

        <p className="text-sm mt-3">
          No account?{" "}
          <Link className="text-blue-600" to="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

