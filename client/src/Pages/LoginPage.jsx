import React from "react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Welcome to OnTime Attendance</h1>
      <div className="space-x-4">
        <Link
          to="/admin/login"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Admin Login
        </Link>
        <Link
          to="/user/login"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          User Login
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
