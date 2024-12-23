import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress"; // Adjust the path as per your project setup

const EmployeesData = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const socketUrl = "http://localhost:5000"; // Backend URL
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate progress during data fetch
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 5 : prev));
    }, 100);

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
        setEmployees(data.employees);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      } finally {
        clearInterval(interval);
        setProgress(100);
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

  const handleViewProfile = (id) => {
    navigate(`/profile/${id}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-gray-500 mt-2">{progress}% Loading employee data...</p>
      </div>
    );
  }

  const handleDelete = (id) => {
    navigate(`/delete/${id}`);
  };

  const handleViewAttendance = (id) => {
    navigate(`/attendance-history/${id}`);
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="overflow-x-auto">
        <table className="table-auto w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-center">Actions</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => {
              const firstName = employee?.firstName || "Unknown";
              const lastName = employee?.lastName || "Unknown";
              const role = employee?.role || "Unknown";
              const isActive = employee?.isActive;

              return (
                <tr
                  key={index}
                  className={`border-b last:border-none ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                  }`}
                >
                  <td className="px-6 py-4 text-gray-800">
                    <div className="font-bold">{`${firstName} ${lastName}`}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{role}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewProfile(employee._id)}
                        className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleViewAttendance(employee._id)}
                        className="bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition"
                      >
                        View Attendance
                      </button>
                    </div>
                  </td>
                  <td
                    className={`px-6 py-4 text-center font-bold ${
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
    </div>
  );
};

export default EmployeesData;
