import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:4000/api/signup", { email, password });
      alert("Signup successful! You can now log in.");
      navigate("/login");
    } catch (error: any) {
      console.log({ error });
      alert(error.response.data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-4">Sign Up</h1>
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
          onClick={handleSignup}
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
        >
          Sign Up
        </button>
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
