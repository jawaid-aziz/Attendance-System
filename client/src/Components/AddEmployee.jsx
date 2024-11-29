import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../Data/UserData";

const AddEmployeeForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [checkedIn] = useState(false);
  const [checkedInTime] = useState(null);
  const [halfLeaveCount] = useState(0);
  const [dailyAttendance] = useState([]);

  const { addUser, generateUniqueId } = useUserData();

  const navigate = useNavigate();

  const handleBackToAdmin = () => {
    navigate(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create new user object
    const newUser = {
      id: generateUniqueId(), // Using Date.now() to create a unique ID
      name,
      email,
      role,
      salary: parseInt(salary), // Convert salary to a number
      checkedIn,
      checkedInTime,
      halfLeaveCount,
      dailyAttendance,
    };

    // Add the new user to the data
    addUser(newUser);

    alert("Employee added successfully!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        {/* Back to Admin Interface Button */}
        <button
          onClick={handleBackToAdmin}
          className="absolute top-8 right-4 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition"
        >
          Back to Admin
        </button>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Add Employee</h1>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter employee name"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter employee email"
              required
            />
          </div>

          {/* Role */}
          <div className="mb-4">
            <label
              htmlFor="role"
              className="block text-gray-700 font-medium mb-2"
            >
              Role
            </label>
            <input
              type="text"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter employee role"
              required
            />
          </div>

          {/* Salary */}
          <div className="mb-4">
            <label
              htmlFor="salary"
              className="block text-gray-700 font-medium mb-2"
            >
              Salary
            </label>
            <input
              type="number"
              id="salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter employee salary"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Add Employee
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeForm;
