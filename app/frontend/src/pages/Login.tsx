import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:4000/api/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      alert("Login successful!");
      navigate("/");
    } catch (error) {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Login
        </button>
        <p className="mt-4 text-sm text-center text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
