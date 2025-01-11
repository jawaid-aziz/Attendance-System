import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export const DeleteEmployee = () => {
  const { id } = useParams(); // Get user ID from the route
  const navigate = useNavigate(); // For navigation after deletion
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/byId/getUser/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          toast.error("Failed to fetch user data", { duration: 5000 });
        }

        const data = await response.json();
        setUser(data.user);
        setLoading(false);
      } catch (err) {
        toast.error(err.message, { duration: 5000 });
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
        toast.error(errorData.message || "Failed to delete user", { duration: 5000 });
      }

      toast.success("User deleted successfully!", { duration: 5000 });
      navigate("/employees-data");
    } catch (err) {
      toast.error(`Error deleting user: ${err.message}`, { duration: 5000 });
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading user details...</div>;
  }

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
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
          className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete User
        </button>
      </div>
    </>
  );
};
