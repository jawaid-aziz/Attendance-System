import { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Switch } from "@/Components/ui/switch";
import { Input } from "@/Components/ui/input";
import { Clock, Save, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { API_URL } from "@/lib/config";

const initialSchedule = {
  Monday: { isOpen: true, startTime: "09:00", endTime: "17:00" },
  Tuesday: { isOpen: true, startTime: "09:00", endTime: "17:00" },
  Wednesday: { isOpen: true, startTime: "09:00", endTime: "17:00" },
  Thursday: { isOpen: true, startTime: "09:00", endTime: "17:00" },
  Friday: { isOpen: true, startTime: "09:00", endTime: "17:00" },
  Saturday: { isOpen: false, startTime: "09:00", endTime: "17:00" },
  Sunday: { isOpen: false, startTime: "09:00", endTime: "17:00" },
};

const WEEKENDS = ["Saturday", "Sunday"];
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const OfficeTimings = () => {
  const [officeSchedule, setOfficeSchedule] = useState(initialSchedule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch the office schedule from the server on component mount
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/admin/getOfficeTiming`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const schedule = data.schedule || data; // tolerate legacy shape

          const filteredSchedule = DAYS_OF_WEEK.reduce((acc, day) => {
            acc[day] = schedule[day] || initialSchedule[day];
            return acc;
          }, {});

          setOfficeSchedule(filteredSchedule);
        } else {
          toast.error("Failed to fetch office schedule.");
        }
      } catch (error) {
        toast.error(`${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Toggle the open/closed status for a day
  const handleToggle = (day) => {
    setOfficeSchedule((prevState) => ({
      ...prevState,
      [day]: {
        ...prevState[day],
        isOpen: !prevState[day].isOpen,
      },
    }));
  };

  // Change start or end time for a given day
  const handleTimeChange = (day, type, value) => {
    setOfficeSchedule((prevState) => ({
      ...prevState,
      [day]: {
        ...prevState[day],
        [type]: value,
      },
    }));
  };

  // Save the schedule back to the server
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/saveOfficeTiming`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schedule: officeSchedule }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Office schedule saved successfully.");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to save office schedule.");
      }
    } catch (error) {
      toast.error(`${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const dayCard = (day) => (
    <Card
      key={day}
      className={`rounded-2xl border-slate-100 shadow-sm ${
        WEEKENDS.includes(day)
          ? "bg-slate-50/60"
          : "bg-white"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base capitalize">
          {day}
          {!officeSchedule[day].isOpen && (
            <span className="text-xs font-medium text-slate-400">
              · Closed
            </span>
          )}
        </CardTitle>
        <Switch
          checked={officeSchedule[day].isOpen}
          onCheckedChange={() => handleToggle(day)}
        />
      </CardHeader>
      {officeSchedule[day].isOpen && (
        <CardContent className="flex items-center gap-3 pt-0">
          <Input
            type="time"
            value={officeSchedule[day].startTime}
            onChange={(e) =>
              handleTimeChange(day, "startTime", e.target.value)
            }
          />
          <span className="text-sm text-slate-400">to</span>
          <Input
            type="time"
            value={officeSchedule[day].endTime}
            onChange={(e) =>
              handleTimeChange(day, "endTime", e.target.value)
            }
          />
        </CardContent>
      )}
    </Card>
  );

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Configure Office Timings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Set open days and hours. Weekends are shown in a lighter shade.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {DAYS_OF_WEEK.map(dayCard)}
            </div>

            <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cornflower-blue-50 text-cornflower-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Office schedule
                  </p>
                  <p className="text-xs text-slate-500">
                    Saved changes apply immediately.
                  </p>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Schedule
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default OfficeTimings;
