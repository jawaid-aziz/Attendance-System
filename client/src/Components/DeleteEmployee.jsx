import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const DeleteEmployee = () => {
  const { id } = useParams(); // Get user ID from the route
  const navigate = useNavigate(); // For navigation after deletion
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
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
        setUser(data.user);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    const confirmation = window.confirm(
      `Are you sure you want to delete ${user.firstName} ${user.lastName}?`
    );
    if (!confirmation) return;

    try {
      const response = await fetch(`http://localhost:5000/admin/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      alert("User deleted successfully!");
      navigate("/employees-data"); // Navigate back to admin dashboard after deletion
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading user details...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Delete User</h1>
      <div className="mb-4">
        <label className="block font-medium">First Name:</label>
        <p>{user.firstName}</p>
      </div>
      <div className="mb-4">
        <label className="block font-medium">Last Name:</label>
        <p>{user.lastName}</p>
      </div>
      <div className="mb-4">
        <label className="block font-medium">Email:</label>
        <p>{user.email}</p>
      </div>
      <div className="mb-4">
        <label className="block font-medium">Role:</label>
        <p>{user.role}</p>
      </div>
      <div className="mb-4">
        <label className="block font-medium">Phone:</label>
        <p>{user.phone}</p>
      </div>
      <div className="mb-4">
        <label className="block font-medium">Address:</label>
        <p>{user.address}</p>
      </div>
      <div className="mb-4">
        <label className="block font-medium">Salary:</label>
        <p>{user.salary}</p>
      </div>
      <button
        onClick={handleDelete}
        className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Delete User
      </button>
    </div>
  );
};
