import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../Data/UserData";
import { useRole } from "../Context/RoleProvider";
import { useId } from "../Context/IdProvider";

const Login = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { users } = useUserData();
  const { setId } = useId();
  const { setRole } = useRole(); 

  const navigate = useNavigate();

  // Mock password (for simplicity, we assume all users have the same password for now)
  const MOCK_PASSWORD = "12345";

  const handleLogin = (e) => {
    e.preventDefault();

    const user = users.find((user) => user.id === parseInt(loginId));

    if (!user) {
      setErrorMessage("User ID not found!");
      return;
    }

    if (password !== MOCK_PASSWORD) {
      setErrorMessage("Incorrect password!");
      return;
    }

    setId(user.id);

        // Check if the login ID is 100
        if (parseInt(loginId) === 100) {
          setRole("admin");
          navigate(`/admin-interface/${loginId}`);
          return;
        }

    // Redirect to the attendance page for the user
    setRole("user");
    navigate(`/user-interface/${loginId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Login</h1>
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              htmlFor="loginId"
              className="block text-gray-700 font-medium mb-2"
            >
              Login ID
            </label>
            <input
              type="text"
              id="loginId"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter your login ID"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
