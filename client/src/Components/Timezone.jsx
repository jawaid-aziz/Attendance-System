import React, { useState, useEffect } from "react";
import timezoneData from "../Data/Timezones.json";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const Timezone = () => {
  const [timezones, setTimezones] = useState([]);
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [currentTimezone, setCurrentTimezone] = useState(""); // New state for current timezone
  const [loading, setLoading] = useState(false);

  // Fetch current timezone from the backend
  useEffect(() => {
    const fetchCurrentTimezone = async () => {
      try {
        const response = await fetch("http://localhost:5000/admin/getTime", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        

        if (!response.ok) {
          throw new Error("Failed to fetch current timezone.");
        }

        const data = await response.json();
        setCurrentTimezone(data.timezone); // Set the current timezone from the backend
      } catch (error) {
        console.log(localStorage.getItem("token"));
        console.error("Error fetching current timezone:", error.message);
        alert("Failed to load current timezone.");
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
      const response = await fetch("http://localhost:5000/admin/updateTime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ timezone: selectedTimezone }),
      });

      if (!response.ok) {
        throw new Error("Failed to save timezone.");
      }

      alert("Timezone updated successfully!");
      setCurrentTimezone(selectedTimezone); // Update the displayed timezone after saving
    } catch (error) {
      console.error("Error saving timezone:", error.message);
      alert("Failed to update timezone.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-8">
      <Card className="w-full max-w-lg p-6 shadow-lg rounded-lg">
        <CardHeader className="text-center mb-4">
          <h1 className="text-2xl font-bold">Manage Timezone</h1>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">
              <strong>Current Timezone:</strong> {currentTimezone || "Loading..."}
            </p>
            <Select onValueChange={handleTimezoneChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Timezone" className="h-full"/>
              </SelectTrigger>
              <SelectContent  className="2xl:h-full lg:h-94 h-60 " >
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
            {loading ? "Saving..." : "Save Timezone"}
          </Button>
        </CardContent>
        <CardFooter className="text-center text-gray-500 text-sm mt-4">
          Please select and save your desired timezone.
        </CardFooter>
      </Card>
    </div>
  );
};
