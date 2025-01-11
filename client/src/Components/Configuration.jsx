import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export const Configuration = () => {
  const [deductionsEnabled, setDeductionsEnabled] = useState(false);
  const [deductionRate, setDeductionRate] = useState(0);

  // Fetch existing configuration on load
  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/admin/getDeductions",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setDeductionsEnabled(data.deductionsEnabled);
          setDeductionRate(data.deductionRate);
        } else {
          toast.error("Failed to fetch configuration", { duration: 5000 });
        }
      } catch (error) {
        toast.error(`Failed to fetch configuration: ${error.message}`, { duration: 5000 });
      }
    };

    fetchConfiguration();
  }, []);

  const handleToggleDeductions = () => {
    setDeductionsEnabled((prev) => !prev);
  };

  const handleRateChange = (e) => {
    const rate = parseFloat(e.target.value);
    if (rate >= 0) {
      setDeductionRate(rate);
    } else {
      toast.error("Deduction rate must be a non-negative number.", { duration: 5000 });
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/admin/updateDeductions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            deductionsEnabled,
            deductionRate,
          }),
        }
      );

      if (!response.ok) {
        toast.error("Failed to save configuration.", { duration: 5000 });
      }

      toast.success("Configuration saved successfully.", { duration: 5000 });
    } catch (error) {
      toast.error(`Failed to save configuration: ${error.message}`);
    }
  };

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Configuration</h1>
        <div className="mb-6">
          <label className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={deductionsEnabled}
              onChange={handleToggleDeductions}
              className="form-checkbox"
            />
            <span>Enable Deductions</span>
          </label>
        </div>
        {deductionsEnabled && (
          <div className="mb-6">
            <label className="block mb-2 text-gray-700 font-semibold">
              Deduction Rate (%):
            </label>
            <input
              type="number"
              min="0"
              value={deductionRate}
              onChange={handleRateChange}
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>
        )}
        <button
          onClick={handleSaveConfiguration}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Save Configuration
        </button>
      </div>
    </>
  );
};
