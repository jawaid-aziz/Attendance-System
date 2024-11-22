import React, { useState, useEffect } from "react";

const Attendance = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Javaid Memon",
      email: "javaidmemon24@gmail.com",
      salary: 50000,
      role: "Backend Developer",
      checkedIn: false,
      checkInTime: null,
    },
    {
      id: 2,
      name: "Ahtisham",
      email: "ahtisham@gmail.com",
      salary: 50000,
      role: "Frontend Developer",
      checkedIn: false,
      checkInTime: null,
    },
  ]);

  const [dailyAttendance, setDailyAttendance] = useState([]);

  const [isAllowedTime, setIsAllowedTime] = useState(false);

  // Function to check if the current time is between 7 PM and 4 AM
  const checkAllowedTime = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 19 || currentHour < 4) {
      setIsAllowedTime(true);
    } else {
      setIsAllowedTime(false);
    }
  };

  useEffect(() => {
    checkAllowedTime();
    const interval = setInterval(checkAllowedTime, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const handleCheckOut = (id) => {
    const currentTime = new Date();
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === id && user.checkedIn) {
          // Add attendance entry only for user ID 1
          if (user.id === 1) {
            setDailyAttendance((prevAttendance) => {
              // Prevent duplicate entries
              const lastEntry =
                prevAttendance.length > 0
                  ? prevAttendance[prevAttendance.length - 1]
                  : null;
              const isDuplicate =
                lastEntry &&
                lastEntry.date === user.checkInTime.toLocaleDateString() &&
                lastEntry.checkInTime === user.checkInTime.toLocaleTimeString();

              if (!isDuplicate) {
                return [
                  ...prevAttendance,
                  {
                    date: user.checkInTime.toLocaleDateString(),
                    checkInTime: user.checkInTime.toLocaleTimeString(),
                    checkOutTime: currentTime.toLocaleTimeString(),
                  },
                ];
              }
              return prevAttendance;
            });
          }
          return { ...user, checkedIn: false, checkInTime: null };
        }
        return user;
      })
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">User Attendance</h1>
      <p className="mb-4 text-gray-600">
        {isAllowedTime
          ? "Check-in and Check-out are enabled during allowed hours."
          : "Attendance is disabled outside allowed hours (7 PM - 4 AM)."}
      </p>
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
              <td className="border border-gray-300 px-4 py-2">{user.salary}</td>
              <td className="border border-gray-300 px-4 py-2">{user.role}</td>
              <td className="border border-gray-300 px-4 py-2">
                {user.checkInTime
                  ? user.checkInTime.toLocaleString()
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

      <h2 className="text-lg font-bold mb-4">Daily Attendance for User ID: 1</h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Check-In Time</th>
            <th className="border border-gray-300 px-4 py-2">Check-Out Time</th>
          </tr>
        </thead>
        <tbody>
          {dailyAttendance.map((entry, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">{entry.date}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.checkInTime}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.checkOutTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
