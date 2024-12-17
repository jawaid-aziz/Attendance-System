import React, { useState, useEffect } from "react";
import { useId } from "../Context/IdProvider";

const Clocking = () => {
  const { id } = useId();
  const [user, setUser] = useState(null);
  const [isAllowedTime, setIsAllowedTime] = useState(false);
  const [checkedIn, setCheckedIn] = useState();

  // Check if the current time is within allowed hours
  const checkAllowedTime = () => {
    const currentHour = new Date().getHours();
    setIsAllowedTime(currentHour >= 9 && currentHour < 22);
  };

  useEffect(() => {
    checkAllowedTime();
    const interval = setInterval(checkAllowedTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:5000/byId/getUser/${id}`, {
          method: "GET",
          // headers: {
          //     Authorization: `Bearer ${localStorage.getItem("token")}`,
          // },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data.");
        }

        const data = await response.json();
        setUser(data.user);
        
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    fetchUser();
  }, [id]);

  // Handle check-in
  const handleCheckIn = async () => {
    try {
      const response = await fetch(`http://localhost:5000/attend/check-in/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Failed to check in.");
        return;
      }

      const data = await response.json();
      setCheckedIn(true);
      console.log("Checked in:", checkedIn);

      setUser((prev) => ({
        ...prev,
        checkInTime: new Date(data.attendance.date),
      }));

      alert("Check-in successful!");
    } catch (error) {
      console.error("Error during check-in:", error.message);
      alert("An error occurred during check-in.");
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    try {
      const response = await fetch(`http://localhost:5000/attend/check-out/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Failed to check out.");
        return;
      }

      const data = await response.json();
      setCheckedIn(false);

      setUser((prev) => ({
        ...prev,
        checkInTime: null,
      }));

      alert("Check-out successful!");
    } catch (error) {
      console.error("Error during check-out:", error.message);
      alert("An error occurred during check-out.");
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

  if (!user) return <p>Loading user data...</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Attendance for {user.firstName}</h1>
      </div>

      {/* Attendance Actions */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleCheckIn}
          disabled={!isAllowedTime || checkedIn}
        >
          Check-In
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleCheckOut}
          disabled={ !checkedIn}
        >
          Check-Out
        </button>
      </div>
    </div>
  );
};

export default Clocking;
