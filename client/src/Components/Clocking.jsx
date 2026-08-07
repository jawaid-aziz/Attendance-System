import { useState, useEffect } from "react";
import { useId } from "../Context/IdProvider";
import { useUser } from "../hooks/useUser";
import { API_URL } from "@/lib/config";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/Components/ui/card";
import { Progress } from "@/Components/ui/progress";
import { Button } from "@/Components/ui/button";
import toast, { Toaster } from "react-hot-toast";

const Clocking = () => {
  const { id } = useId();
  const user = useUser(id);
  const [progress, setProgress] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);

  const [currentDaySchedule, setCurrentDaySchedule] = useState(null);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/attend/status/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        toast.error(`HTTP error! Status: ${response.status}`, {
          duration: 5000,
        });
        return;
      }

      const data = await response.json();
      setCheckedIn(!!data.checkedIn);
      setCheckedOut(!!data.checkedOut);
    } catch (error) {
      toast.error(`Error fetching attendance status: ${error.message}`, {
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
  }, [id]);

  //office timing
  useEffect(() => {
    const fetchOfficeSchedule = async () => {
      try {
        const response = await fetch(
          `${API_URL}/admin/getOfficeTiming`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          toast.error("Failed to fetch office schedule.", { duration: 5000 });
          return;
        }

        const data = await response.json();
        const schedule = data.schedule || data; // tolerate legacy shape
        const timezoneName = data.timezone || "Asia/Karachi";
        const today = new Date().toLocaleDateString("en-US", {
          timeZone: timezoneName,
          weekday: "long",
        });
        setCurrentDaySchedule(schedule[today]);
      } catch (error) {
        toast.error(`Error fetching office schedule: ${error.message}`, {
          duration: 5000,
        });
      }
    };

    fetchOfficeSchedule();
  }, []);

  // Progress bar while the user profile loads (served from the useUser cache).
  useEffect(() => {
    if (user) {
      setProgress(100);
      return;
    }
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 5 : prev));
    }, 100);
    return () => clearInterval(interval);
  }, [user]);

  const loading = !user;

  // Handle check-in
  const handleCheckIn = async () => {
    try {
      const response = await fetch(
        `${API_URL}/attend/check-in/${id}`,
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
        toast.error(errorData.message || "Failed to check in.", {
          duration: 5000,
        });
        return;
      }

      fetchAttendanceStatus();
      toast.success("Check-in successful!", { duration: 5000 });
    } catch (error) {
      toast.error(`An error occurred during check-in: ${error.message}`, {
        duration: 5000,
      });
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    try {
      const response = await fetch(
        `${API_URL}/attend/check-out/${id}`,
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
        toast.error(errorData.message || "Failed to check out.", {
          duration: 5000,
        });
        return;
      }

      // Re-fetch attendance status
      await fetchAttendanceStatus();

      toast.success("Check-out successful!", { duration: 5000 });
    } catch (error) {
      toast.error(`An error occurred during check-out: ${error.message}`, {
        duration: 5000,
      });
    }
  };

  const isOfficeOpen = currentDaySchedule?.isOpen;

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />

      <div>
        <Card className="flex flex-col justify-center items-center w-full text-center max-w-lg p-4 shadow-lg rounded-lg">
          <CardHeader>
            <h1 className="text-2xl font-bold">Attendance</h1>
          </CardHeader>

          {loading && (
            <div className="w-full my-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500 mt-2">Loading...</p>
            </div>
          )}
          {!loading ? (
            <>
              <CardContent>
                <div className=" mb-6">
                  <h2 className="text-xl font-semibold capitalize">
                    Welcome,{" "}
                    <span className="text-blue-600">{user.firstName}</span>
                  </h2>
                  {user.checkInTime && (
                    <p className="text-base text-gray-700">
                      Check-In Time:{" "}
                      {new Date(user.checkInTime).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    disabled={!isOfficeOpen || checkedIn}
                    onClick={handleCheckIn}
                    className="px-4 py-2 text-lg"
                  >
                    Check-In
                  </Button>
                  <Button
                    variant="default"
                    disabled={!isOfficeOpen || !checkedIn || checkedOut}
                    onClick={handleCheckOut}
                    className="px-4 py-2 text-lg"
                  >
                    Check-Out
                  </Button>
                </div>
              </CardContent>
              <CardFooter className=" text-gray-500 text-sm mt-4">
                {isOfficeOpen
                  ? "Check-in is only allowed during office hours."
                  : "The office is closed today."}
              </CardFooter>
            </>
          ) : (
            <p>Server Error. Try Again</p>
          )}
        </Card>
      </div>
    </>
  );
};

export default Clocking;
