import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAttendance } from "../Context/AttendanceProvider";
import { useUserData } from "../Data/UserData";

const Clocking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { getUserById, updateAttendance } = useAttendance();
  const [isAllowedTime, setIsAllowedTime] = useState(false);
  const { users } = useUserData(); 

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

  useEffect(() => {
    const selectedUser = users.find(
      (user) => user.id === parseInt(id)
    );
    setUser(selectedUser);
  }, [id]);

  // Handle check-in
  const handleCheckIn = () => {
    const currentTime = new Date();
    const updatedUser = {
      ...user,
      checkedIn: true,
      checkInTime: currentTime,
    };
    setUser(updatedUser);
    updateAttendance(user.id, updatedUser.dailyAttendance);
  };

  // Handle check-out
  const handleCheckOut = () => {
    const currentTime = new Date();
    if (user && user.checkedIn) {
      const checkInTime = user.checkInTime;
      const isHalfLeave = calculateHalfLeave(checkInTime);

      const updatedAttendance = [
        ...user.dailyAttendance,
        {
          date: checkInTime.toLocaleDateString(),
          checkInTime: checkInTime.toLocaleTimeString(),
          checkOutTime: currentTime.toLocaleTimeString(),
          halfLeave: isHalfLeave,
        },
      ];

      let updatedHalfLeaveCount = user.halfLeaveCount;
      let salaryThisMonth = user.salary;

      if (isHalfLeave) {
        updatedHalfLeaveCount += 1;
        if (updatedHalfLeaveCount === 3) {
          salaryThisMonth -= user.salary / 30; // Deduct 1 day's salary
          updatedHalfLeaveCount = 0;
        }
      }

      setUser({
        ...user,
        checkedIn: false,
        checkInTime: null,
        halfLeaveCount: updatedHalfLeaveCount,
        dailyAttendance: updatedAttendance,
        salaryThisMonth: Math.floor(salaryThisMonth),
      });
      updateAttendance(user.id, updatedAttendance);
    }
  };

  // Check if the check-in time qualifies as half-leave
  const calculateHalfLeave = (checkInTime) => {
    const checkInHour = checkInTime.getHours();
    const checkInMinutes = checkInTime.getMinutes();
    if (checkInHour > 19) return true;
    if (checkInHour === 19 && checkInMinutes > 15) return true;
    return false;
  };

  const handleLogout = () => {
    navigate("/"); // Redirect to the login page
  };

  if (!user) return <p>Loading user data...</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Attendance for {user.name}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Log Out
        </button>
      </div>

      {/* Attendance Actions */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleCheckIn}
          disabled={!isAllowedTime || user.checkedIn}
        >
          Check-In
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleCheckOut}
          disabled={!isAllowedTime || !user.checkedIn}
        >
          Check-Out
        </button>
        <button
          onClick={() => navigate(`/attendance-history/${id}`)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Show Attendance
        </button>
      </div>
    </div>
  );
};

export default Clocking;
