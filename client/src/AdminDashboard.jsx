import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketUrl = "http://localhost:5000"; // Backend URL

  useEffect(() => {
    // Fetch initial employee data
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${socketUrl}/admin/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();
        // const enrichedEmployees = data.employees.map((employee) => ({
        //   ...employee,
        //   isActive: null, // Default isActive is null
        // }));
        setEmployees(data.employees);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setLoading(false);
      }
    };

    fetchEmployees();

    // Initialize WebSocket connection
    const socket = io(socketUrl);

    // Listen for status updates
    socket.on("status update", (data) => {
      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) => {
          if (employee._id === data.employeeId) {
            return { ...employee, isActive: data.isActive };
          }
          return employee;
        })
      );
    });

    // Cleanup WebSocket connection on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Role</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee, index) => {
            const firstName = employee?.firstName || "Unknown";
            const role = employee?.role || "Unknown";
            const isActive = employee?.isActive;

            return (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">{firstName}</td>
                <td className="border border-gray-300 px-4 py-2">{role}</td>
                <td
                  className={`border border-gray-300 px-4 py-2 ${
                    isActive === null
                      ? "text-gray-500"
                      : isActive
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {isActive === null
                    ? "null"
                    : isActive
                    ? "Active"
                    : "Inactive"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
