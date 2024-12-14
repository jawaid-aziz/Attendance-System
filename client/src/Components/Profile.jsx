import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUserData } from "../Data/UserData";
import { useRole } from "../Context/RoleProvider";

export const Profile = () => {
  const { id } = useParams();
  const { role } = useRole();
  // const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const { users } = useUserData();

  // State for editable fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    phone: "",
    address: "",
    salary: "",
  });

  useEffect(() => {
    // Fetch user profile data
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:5000/byId/getUser/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        console.log("Fetched User Data:", data); // Debug fetched data
        const user = data.user;
        // Populate formData with fetched data
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          role: user.role || "",
          phone: user.phone || "",
          address: user.address || "",
          salary: user.salary || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user profile.");
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit updated profile data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sanitizedFormData = {
        ...formData,
        salary: Number(formData.salary) || 0, // Ensure salary is a valid number
      };
      
      console.log("Payload being sent:", sanitizedFormData); // Debug payload
      const response = await fetch(`http://localhost:5000/admin/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        // body: JSON.stringify(sanitizedFormData),
      });
      console.log("Response Status:", response.status); // Log response status
      const responseData = await response.json();
      console.log("Response Data:", responseData); // Log response data
  
      if (!response===200) {
        throw new Error("Failed to update user data");
      }

      const updatedData = await response.json();
      setUser(updatedData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update profile.");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
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
          <label className="block font-medium mb-1">Role</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
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
            className="w-full border px-3 py-2 rounded bg-gray-100"
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

        {role === "admin" && (
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
