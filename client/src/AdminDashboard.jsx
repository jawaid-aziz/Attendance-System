import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Enhanced debugging listener
    newSocket.on("status update", (data) => {
      console.log("Received FULL status update data:", data);
      console.log("Current employees before update:", employees);

      // Detailed logging
      console.log("Attempting to update employee with ID:", data.employeeId);
      console.log("New active status:", data.isActive);

      // More robust update mechanism
      setEmployees(prevEmployees => {
        const updatedEmployees = prevEmployees.map(employee => {
          if (employee._id === data.employeeId) {
            console.log("MATCH FOUND - Updating employee:", {
              ...employee,
              isActive: data.isActive
            });
            return { ...employee, isActive: data.isActive };
          }
          return employee;
        });

        console.log("Updated employees array:", updatedEmployees);
        return updatedEmployees;
      });
    });

    // Fetch employees' initial status
    const fetchEmployeeStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/attend/status", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();
        console.log("Initial employees fetched:", data.employees);
        setEmployees(data.employees);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee statuses:", error);
        setLoading(false);
      }
    };

    fetchEmployeeStatus();

    // Cleanup
    return () => {
      newSocket.disconnect();
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
          {employees.map((employee) => (
            <tr key={employee._id}>
              <td className="border border-gray-300 px-4 py-2">
                {employee.firstName} {employee.lastName}
              </td>
              <td className="border border-gray-300 px-4 py-2">{employee.role}</td>
              <td
                className={`border border-gray-300 px-4 py-2 ${
                  employee.isActive ? "text-green-500" : "text-red-500"
                }`}
              >
                {employee.isActive ? "Active" : "Inactive"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;