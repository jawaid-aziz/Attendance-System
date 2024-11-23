import React, { useState, useEffect } from "react";
import { USERS_DUMMYDATA } from "../Data/UserData";

const Attendance = () => {
  const [users, setUsers] = useState([...USERS_DUMMYDATA]);
  const [isAllowedTime, setIsAllowedTime] = useState(false);

  // Check if the current time is within allowed hours
  const checkAllowedTime = () => {
    const currentHour = new Date().getHours();
    setIsAllowedTime(currentHour >= 19 || currentHour < 4);
  };

  useEffect(() => {
    checkAllowedTime();
    const interval = setInterval(checkAllowedTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Handle check-in
  const handleCheckIn = (id) => {
    const currentTime = new Date();
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id
          ? { ...user, checkedIn: true, checkInTime: currentTime }
          : user
      )
    );
  };

  // Handle check-out
  const handleCheckOut = (id) => {
    const currentTime = new Date();
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === id && user.checkedIn) {
          const checkInTime = user.checkInTime;
          const isHalfLeave = calculateHalfLeave(checkInTime);

          // Update attendance record
          const updatedAttendance = [
            ...user.dailyAttendance,
            {
              date: checkInTime.toLocaleDateString(),
              checkInTime: checkInTime.toLocaleTimeString(),
              checkOutTime: currentTime.toLocaleTimeString(),
              halfLeave: isHalfLeave,
            },
          ];

          // Handle salary and half-leave adjustments
          let updatedHalfLeaveCount = user.halfLeaveCount;
          let salaryThisMonth = user.salary; 

          if (isHalfLeave) {
            updatedHalfLeaveCount += 1;
            if (updatedHalfLeaveCount === 3) {
              salaryThisMonth -= user.salary / 30; // Deduct 1 day's salary
              updatedHalfLeaveCount = 0; // Reset half-leave count
            }
          }

          return {
            ...user,
            checkedIn: false,
            checkInTime: null,
            halfLeaveCount: updatedHalfLeaveCount,
            dailyAttendance: updatedAttendance,
            salaryThisMonth: Math.floor(salaryThisMonth), // Calculate salary this month
          };
        }
        return user;
      })
    );
  };

  // Check if the check-in time qualifies as half-leave
  const calculateHalfLeave = (checkInTime) => {
    const checkInHour = checkInTime.getHours();
    const checkInMinutes = checkInTime.getMinutes();
    if (checkInHour > 19) return true;
    if (checkInHour === 19 && checkInMinutes > 15) return true;
    return false;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">User Attendance</h1>
      <p className="mb-4 text-gray-600">
        {isAllowedTime
          ? "Check-in and Check-out are enabled during allowed hours."
          : "Attendance is disabled outside allowed hours (7 PM - 4 AM)."}
      </p>

      {/* User Table */}
      <table className="table-auto w-full border-collapse border border-gray-300 mb-6">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Salary</th>
            <th className="border border-gray-300 px-4 py-2">Role</th>
            <th className="border border-gray-300 px-4 py-2">Check-In Time</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border border-gray-300 px-4 py-2">{user.id}</td>
              <td className="border border-gray-300 px-4 py-2">{user.name}</td>
              <td className="border border-gray-300 px-4 py-2">{user.email}</td>
              <td className="border border-gray-300 px-4 py-2">
                {user.salary}
              </td>
              <td className="border border-gray-300 px-4 py-2">{user.role}</td>
              <td className="border border-gray-300 px-4 py-2">
                {user.checkInTime
                  ? user.checkInTime.toLocaleTimeString()
                  : "Not Checked In"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <div className="flex space-x-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
                    onClick={() => handleCheckIn(user.id)}
                    disabled={!isAllowedTime || user.checkedIn}
                  >
                    Check-In
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50"
                    onClick={() => handleCheckOut(user.id)}
                    disabled={!isAllowedTime || !user.checkedIn}
                  >
                    Check-Out
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Attendance Records */}
      {users.map((user) => (
        <div key={user.id} className="mb-6">
          <h2 className="text-lg font-bold mb-4">
            Daily Attendance for User ID: {user.id}
          </h2>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">
                  Check-In Time
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Check-Out Time
                </th>
                <th className="border border-gray-300 px-4 py-2">Half Leave</th>
                <th className="border border-gray-300 px-4 py-2">Salary This Month</th>
              </tr>
            </thead>
            <tbody>
              {user.dailyAttendance.map((entry, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    {entry.date}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {entry.checkInTime}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {entry.checkOutTime}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {entry.halfLeave ? "Yes" : "No"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.salaryThisMonth ? user.salaryThisMonth : user.salary} {/* Display adjusted salary */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Attendance;
