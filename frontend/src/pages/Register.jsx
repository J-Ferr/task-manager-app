import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await axios.post(`${API_URL}/auth/register`, {
      username,
      email,
      password,
    });

    toast.success("Account created successfully!");
    navigate("/login");

  } catch (error) {
    const message =
      error?.response?.data?.message || "Registration failed.";
    toast.error(message);
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4">Register</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

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

        <button className="bg-green-500 text-white py-2 w-full rounded">
          Register
        </button>

        <p className="text-sm mt-3">
          Already have an account?{" "}
          <Link className="text-blue-600" to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
