import React, { useState, useEffect } from "react";
import { useId } from "../Context/IdProvider";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Clocking = () => {
  const { id } = useId();
  const [user, setUser] = useState(null);
  const [isAllowedTime, setIsAllowedTime] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);

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
          <div className="flex justify-around">
            <Button
              variant="default"
              disabled={!isAllowedTime || checkedIn}
              onClick={handleCheckIn}
              className="px-6 py-2 text-lg"
            >
              Check-In
            </Button>
            <Button
              variant="danger"
              disabled={ checkedIn}
              onClick={handleCheckOut}
              className="px-6 py-2 text-lg"
            >
              Check-Out
            </Button>
          </div>
        </CardContent>
        <CardFooter className=" text-gray-500 text-sm mt-4">
          {isAllowedTime ? "You can check-in until 10 PM." : "Check-in is allowed only between 9 AM and 10 PM."}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Clocking;
