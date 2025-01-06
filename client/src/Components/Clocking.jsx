import React, { useState, useEffect } from "react";
import { useId } from "../Context/IdProvider";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Clocking = () => {
  const { id } = useId();
  const [user, setUser] = useState(null);
  const [isAllowedTime, setIsAllowedTime] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState();
  const [loading, setLoading] = useState(true);
  // Check if the current time is within allowed hours

  const fetchServerTime = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/attend/server-time"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch server time.");
      }

      const data = await response.json();
      setIsAllowedTime(data.isAllowedTime); // Server determines allowed time
    } catch (error) {
      console.error("Error fetching server time:", error.message);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/attend/status/${id}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log(data);
      setCheckedIn(data.checkedIn);
      if ((data.checkedIn && data.checkedOut) === true) {
        setCheckedIn(true);
        setCheckedOut(true);
      }
    } catch (error) {
      console.error("Error fetching attendance status:", error.message);
    }
  };

  useEffect(() => {
    fetchServerTime();
    fetchAttendanceStatus();
  }, [id]);

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
      const response = await fetch(
        `http://localhost:5000/attend/check-in/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Failed to check in.");
        return;
      }

      const data = await response.json();
      
      console.log("Checked in:", checkedIn);

      setUser((prev) => ({
        ...prev,
        // checkInTime: new Date(data.attendance.date),
      }));
      fetchAttendanceStatus();
      alert("Check-in successful!");
      // await fetchAttendanceStatus();
    } catch (error) {
      console.error("Error during check-in:", error.message);
      alert("An error occurred during check-in.");
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/attend/check-out/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Failed to check out.");
        return;
      }

      const data = await response.json();
      

      setUser((prev) => ({
        ...prev,
        // checkInTime: null,
      }));

          // Re-fetch attendance status
    await fetchAttendanceStatus();

      alert("Check-out successful!");
    } catch (error) {
      console.error("Error during check-out:", error.message);
      alert("An error occurred during check-out.");
    }
  };

  if (!user) return <p>Loading user data...</p>;

  return (
    <div>
      <Card className="flex flex-col justify-center items-center w-full text-center max-w-lg p-4 shadow-lg rounded-lg">
        <CardHeader>
          <h1 className="text-2xl font-bold">Attendance</h1>
        </CardHeader>
        <CardContent>
          <div className=" mb-6">
            <h2 className="text-xl font-semibold">
              Welcome, <span className="text-blue-600">{user.firstName}</span>
            </h2>
            {user.checkInTime && (
              <p className="text-base text-gray-700">
                Check-In Time: {new Date(user.checkInTime).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              disabled={ checkedIn}
              onClick={handleCheckIn}
              className="px-4 py-2 text-lg"
            >
              Check-In
            </Button>
            <Button
              variant="default"
              disabled={!checkedIn || checkedOut}
              onClick={handleCheckOut}
              className="px-4 py-2 text-lg"
            >
              Check-Out
            </Button>
          </div>
        </CardContent>
        <CardFooter className=" text-gray-500 text-sm mt-4">
            Check-in is only allowed between 9:00 AM and 5:00 PM
        </CardFooter>
      </Card>
    </div>
  );
};

export default Clocking;
