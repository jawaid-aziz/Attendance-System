import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useId } from "../Context/IdProvider";
import { useUser } from "../hooks/useUser";
import { useServerTime } from "../hooks/useServerTime";
import { API_URL } from "@/lib/config";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/Components/ui/card";
import { Progress } from "@/Components/ui/progress";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Clock, LogIn, LogOut, CheckCircle2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  formatDuration,
  minutesInTimezone,
  minutesToHHMM,
  timeStringToMinutes,
} from "@/lib/format";

const Clocking = ({ todayRecord = null }) => {
  const { id } = useId();
  const user = useUser(id);
  const slug = localStorage.getItem("slug") || "";
  const { now, timezone } = useServerTime(slug);
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
  const startMinutes = timeStringToMinutes(currentDaySchedule?.startTime);
  const endMinutes = timeStringToMinutes(currentDaySchedule?.endTime);
  const checkInMinutes =
    todayRecord?.checkIn != null
      ? timeStringToMinutes(todayRecord.checkIn)
      : null;

  const nowMinutes = minutesInTimezone(now, timezone);
  const expectedMinutes =
    isOfficeOpen && startMinutes != null && endMinutes != null
      ? Math.max(0, endMinutes - startMinutes)
      : 0;
  const workedMinutes =
    isOfficeOpen && checkInMinutes != null
      ? Math.max(0, nowMinutes - checkInMinutes)
      : 0;
  const dayProgress =
    expectedMinutes > 0 ? Math.min(100, (workedMinutes / expectedMinutes) * 100) : 0;

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />

      <Card className="flex h-full w-full flex-col items-center justify-center rounded-2xl border-slate-100 p-6 text-center shadow-sm">
        <CardHeader className="pb-4">
          <h1 className="text-2xl font-bold">Attendance</h1>
          {isOfficeOpen && (
            <Badge className="mt-1 border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
              Office open today
            </Badge>
          )}
        </CardHeader>

        {loading && (
          <div className="w-full my-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">Loading...</p>
          </div>
        )}
        {!loading ? (
          <>
            <CardContent className="w-full">
              <div className="mb-6">
                <h2 className="text-xl font-semibold capitalize">
                  Welcome,{" "}
                  <span className="text-cornflower-blue-600">
                    {user.firstName}
                  </span>
                </h2>
                {todayRecord?.checkIn && (
                  <p className="mt-1 flex items-center justify-center gap-1.5 text-base text-gray-700">
                    <Clock className="h-4 w-4 text-cornflower-blue-500" />
                    Checked in at{" "}
                    <span className="font-mono font-semibold text-cornflower-blue-600">
                      {minutesToHHMM(checkInMinutes)}
                    </span>
                    {checkedOut && " · Checked out"}
                  </p>
                )}
              </div>

              {isOfficeOpen && (
                <div className="mb-6">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Day so far</span>
                    <span className="font-semibold text-slate-700">
                      {formatDuration(workedMinutes)} /{" "}
                      {formatDuration(expectedMinutes)}
                    </span>
                  </div>
                  <Progress
                    value={dayProgress}
                    className="h-2.5"
                    indicatorClassName="bg-cornflower-blue-600"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="default"
                  disabled={!isOfficeOpen || checkedIn}
                  onClick={handleCheckIn}
                  className="gap-2 px-4 py-2 text-lg"
                >
                  <LogIn className="h-5 w-5" />
                  Check-In
                </Button>
                <Button
                  variant="default"
                  disabled={!isOfficeOpen || !checkedIn || checkedOut}
                  onClick={handleCheckOut}
                  className="gap-2 px-4 py-2 text-lg"
                >
                  <LogOut className="h-5 w-5" />
                  Check-Out
                </Button>
              </div>
            </CardContent>
            <CardFooter className="mt-4 flex flex-col gap-1 text-sm text-gray-500">
              {isOfficeOpen ? (
                <>
                  <span>
                    Office hours: {minutesToHHMM(startMinutes)} –{" "}
                    {minutesToHHMM(endMinutes)}
                  </span>
                  {checkedOut && (
                    <span className="flex items-center gap-1 font-medium text-green-600">
                      <CheckCircle2 className="h-4 w-4" /> Day complete
                    </span>
                  )}
                </>
              ) : (
                "The office is closed today."
              )}
            </CardFooter>
          </>
        ) : (
          <p>Server Error. Try Again</p>
        )}
      </Card>
    </>
  );
};

Clocking.propTypes = {
  todayRecord: PropTypes.shape({
    checkIn: PropTypes.string,
  }),
};

export default Clocking;
