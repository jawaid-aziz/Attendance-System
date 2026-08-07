import { useState, useEffect } from "react";
import timezoneData from "../Data/Timezones.json";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/Components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/Components/ui/select";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Loader2, Globe, Save } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { API_URL } from "@/lib/config";

export const Timezone = () => {
  const [timezones, setTimezones] = useState([]);
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [currentTimezone, setCurrentTimezone] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch current timezone from the backend
  useEffect(() => {
    const fetchCurrentTimezone = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/getTime`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          toast.error("Failed to fetch current timezone.", { duration: 5000 });
        }

        const data = await response.json();
        setCurrentTimezone(data.timezone);
      } catch (error) {
        console.error("Error fetching current timezone:", error.message);
        toast.error("Failed to load current timezone.", { duration: 5000 });
      }
    };

    fetchCurrentTimezone();
  }, []);

  // Load timezone data
  useEffect(() => {
    setTimezones(timezoneData);
  }, []);

  const handleTimezoneChange = (value) => {
    setSelectedTimezone(value);
  };

  const saveTimezone = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/updateTime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ timezone: selectedTimezone }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.message || "Failed to save timezone.", {
          duration: 5000,
        });
        return;
      }

      toast.success("Timezone updated successfully!", { duration: 5000 });
      setCurrentTimezone(selectedTimezone);
      setSelectedTimezone("");
    } catch (error) {
      console.error("Error saving timezone:", error.message);
      toast.error("Failed to update timezone.", { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Manage Timezone
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Choose the timezone your office runs on.
          </p>
        </div>

        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-cornflower-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Workspace Timezone
              </h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 rounded-xl bg-cornflower-blue-50 px-4 py-3">
              <Globe className="h-5 w-5 shrink-0 text-cornflower-blue-600" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-cornflower-blue-600">
                  Current timezone
                </p>
                <p className="truncate text-sm font-semibold text-slate-900">
                  {currentTimezone || "Loading…"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Select new timezone</Label>
              <Select
                value={selectedTimezone || undefined}
                onValueChange={handleTimezoneChange}
              >
                <SelectTrigger id="timezone" className="w-full">
                  <SelectValue placeholder="Select Timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {timezones.map((tz, index) => (
                    <SelectItem key={index} value={tz.utc[0]}>
                      {tz.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={saveTimezone}
              disabled={loading || !selectedTimezone}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Timezone
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="text-sm text-slate-400">
            Attendance timestamps are recorded in this timezone.
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
