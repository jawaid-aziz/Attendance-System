import React, { useState, useEffect } from "react";
import timezoneData from "../Data/Timezones.json";

export const SystemSettings = () => {
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

  const handleTimezoneChange = (e) => {
    setSelectedTimezone(e.target.value);
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
    <div className="max-w-lg mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">Manage Timezone</h1>
      <div className="mb-4">
        {/* Display the current timezone */}
        <p className="text-gray-600 mb-2">
          <strong>Current Timezone:</strong> {currentTimezone || "Loading..."}
        </p>

        {/* Dropdown to select new timezone */}
        <label className="block font-medium mb-2">Select Timezone:</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={selectedTimezone}
          onChange={handleTimezoneChange}
        >
          <option value="">-- Select Timezone --</option>
          {timezones.map((tz, index) => (
            <option key={index} value={tz.utc[0]}>
              {tz.text}
            </option>
          ))}
        </select>
      </div>
      <button
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={saveTimezone}
        disabled={loading || !selectedTimezone}
      >
        {loading ? "Saving..." : "Save Timezone"}
      </button>
    </div>
  );
};
