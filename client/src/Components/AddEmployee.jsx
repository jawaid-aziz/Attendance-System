import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../Data/UserData";

const AddEmployeeForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("User");
  const [jobTitle, setJobTitle] = useState("");
  const [gender, setGender] = useState("Male");
  const [contact, setContact] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
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
      firstName,
      lastName,
      username,
      email: email || null,
      role,
      jobTitle,
      gender,
      contact,
      country,
      city,
      address,
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
 
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Add Employee</h1>

        <form onSubmit={handleSubmit}>
          {/* First Name */}
          <div className="mb-4">
            <label
              htmlFor="firstName"
              className="block text-gray-700 font-medium mb-2"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter employee first name"
              required
            />
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <label
              htmlFor="lastName"
              className="block text-gray-700 font-medium mb-2"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter employee last name"
              required
            />
          </div>

          {/* username */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 font-medium mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter employee username"
              required
            />
          </div>                    

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email (optional)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter employee email"
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
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              required
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Job Title */}
          <div className="mb-4">
            <label
              htmlFor="jobTitle"
              className="block text-gray-700 font-medium mb-2"
            >
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter employee job title"
              required
            />
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label htmlFor="gender" className="block text-gray-700 font-medium mb-2">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Contact Number */}
          <div className="mb-4">
            <label
              htmlFor="contact"
              className="block text-gray-700 font-medium mb-2"
            >
              Contact Number
            </label>
            <input
              type="text"
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter employee contact number"
              required
            />
          </div>

          {/* Country */}
          <div className="mb-4">
            <label
              htmlFor="country"
              className="block text-gray-700 font-medium mb-2"
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter employee country"
              required
            />
          </div>

          {/* City */}
          <div className="mb-4">
            <label
              htmlFor="city"
              className="block text-gray-700 font-medium mb-2"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter employee city"
              required
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label
              htmlFor="address"
              className="block text-gray-700 font-medium mb-2"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter employee address"
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
