import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useUserData } from "../Data/UserData";
import { useRole } from "../Context/RoleProvider";

export const Profile = () => {
  const { id } = useParams();
  const {role} = useRole();
  const { users } = useUserData(); // Access the user data
  console.log("Users Data:", users); 
  const user = users.find((u) => u.id === Number(id)); // Find the user with the matching ID

  console.log("ID from Params:", id);
console.log("Matching User:", user);


  // State for editable fields
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    email: user?.email || "",
    gender: user?.gender || "",
    contact: user?.contact || "",
    country: user?.country || "",
    city: user?.city || "",
    address: user?.address || "",
    salary: user?.salary || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Data:", formData);
    // You can add logic to update the user data in the context or state here
  };

  if (!user) {
    return <p>User not found</p>;
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <form onSubmit={handleSubmit}>
        {/* Editable Fields */}
        <div className="mb-4">
          <label className="block font-medium mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            readOnly={role !== "admin"}
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            readOnly={role !== "admin"}
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            readOnly={role !== "admin"}
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            readOnly={role !== "admin"}
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        {/* Read-only Fields */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Gender</label>
          <input
            type="text"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            readOnly={role !== "admin"}
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Contact</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            readOnly={role !== "admin"}
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            readOnly={role !== "admin"}
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            readOnly={role !== "admin"}
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            readOnly={role !== "admin"}
            className="w-full border px-3 py-2 rounded bg-gray-100  "
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Salary</label>
          <input
            type="text"
            name="salary"
            value={formData.salary}
            onChange={handleInputChange}
            readOnly={role !== "admin"}
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        {(role === "admin") && (
                    <button
                    type="submit"
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Save Changes
                  </button>
        )}
      </form>
    </div>
  );
};
