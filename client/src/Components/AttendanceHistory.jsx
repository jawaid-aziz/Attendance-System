import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAttendance } from "../Context/AttendanceProvider";

const AttendanceHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getUserById } = useAttendance();

    const [user, setUser] = useState(null);

  // Fetch the user's attendance data based on the ID
  useEffect(() => {
    const selectedUser = getUserById(id);
    if (selectedUser) {
      setUser(selectedUser);
    } else {
      console.error(`No user found with id: ${id}`);
    }
  }, [id, getUserById]);

  if (!user) return <p>Loading attendance history...</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Attendance History for {user.firstName}</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Back to Attendance
        </button>
      </div>

      {/* Attendance Table */}
      <h2 className="text-lg font-bold mb-4">Daily Attendance Records</h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Check-In Time</th>
            <th className="border border-gray-300 px-4 py-2">Check-Out Time</th>
            <th className="border border-gray-300 px-4 py-2">Half Leave</th>
            <th className="border border-gray-300 px-4 py-2">Salary This Month</th>
          </tr>
        </thead>
        <tbody>
          {user.dailyAttendance.map((entry, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">{entry.date}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.checkInTime}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.checkOutTime}</td>
              <td className="border border-gray-300 px-4 py-2">
                {entry.halfLeave ? "Yes" : "No"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {user.salaryThisMonth ? user.salaryThisMonth : user.salary}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceHistory;
