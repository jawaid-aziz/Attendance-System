import React, { useState, useEffect } from "react";
import { useId } from "../Context/IdProvider";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// const dayjs = require("dayjs");
// import dayjs from "dayjs";
// const timezone = require("dayjs/plugin/timezone");
// import { Timezone } from "./Timezone";
// const utc = require("dayjs/plugin/utc")
// const { io } = require("../../index");
// const cron = require("node-cron");

// dayjs.extend(timezone);
// dayjs.extend(utc);
const Clocking = () => {
  const { id } = useId();
  const [user, setUser] = useState(null);
  const [isAllowedTime, setIsAllowedTime] = useState(false);
  const [checkedIn, setCheckedIn] = useState();
  const [loading, setLoading] = useState(true);

  // Check if the current time is within allowed hours
  useEffect(() => {
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

    // const fetchAttendanceStatus = async () => {
    //   try {
    //     const response = await fetch(
    //       `http://localhost:5000/attend/status/${id}`
    //     );
    //     if (!response.ok)
    //       throw new Error(`HTTP error! Status: ${response.status}`);

    //     const data = await response.json();
    //     console.log(data);
    //     const { checkedIn } = await response.json();
    //     setCheckedIn(!checkedIn);
    //   } catch (error) {
    //     console.error("Error fetching attendance status:", error.message);
    //   }
    // };

    fetchServerTime();
    // fetchAttendanceStatus();
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
      setCheckedIn(true);
      console.log("Checked in:", checkedIn);

      setUser((prev) => ({
        ...prev,
        // checkInTime: new Date(data.attendance.date),
      }));

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
    // await fetchAttendanceStatus();

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
              disabled={ checkedIn}
              onClick={handleCheckOut}
              className="px-4 py-2 text-lg"
            >
              Check-Out
            </Button>
          </div>
        </CardContent>
        <CardFooter className=" text-gray-500 text-sm mt-4">
          {isAllowedTime
            ? "You can check-in until 10 PM."
            : "Check-in is allowed only between 9 AM and 10 PM."}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Clocking;
