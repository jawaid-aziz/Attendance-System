import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export const Configuration = () => {
  // States for deduction configuration
  const [deductionsEnabled, setDeductionsEnabled] = useState(false);
  const [deductionRate, setDeductionRate] = useState(0);

  // States for allowed IP configuration
  const [allowedIPs, setAllowedIPs] = useState([]);
  const [newIP, setNewIP] = useState("");

  // Fetch deduction configuration on component load
  useEffect(() => {
    const fetchDeductionConfiguration = async () => {
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
          toast.error("Failed to fetch deduction configuration.", {
            duration: 5000,
          });
        }
      } catch (error) {
        toast.error(
          `Failed to fetch deduction configuration: ${error.message}`,
          { duration: 5000 }
        );
      }
    };

    fetchDeductionConfiguration();
  }, []);

  // Fetch allowed IP configuration on component load
  useEffect(() => {
    const fetchAllowedIPs = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/admin/getAllowedIP",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setAllowedIPs(data.allowedIPs);
        } else {
          toast.error("Failed to fetch allowed IPs.", { duration: 5000 });
        }
      } catch (error) {
        toast.error(`Failed to fetch allowed IPs: ${error.message}`, {
          duration: 5000,
        });
      }
    };

    fetchAllowedIPs();
  }, []);

  // Handle deduction toggling
  const handleToggleDeductions = () => {
    setDeductionsEnabled((prev) => !prev);
  };

  // Handle deduction rate change
  const handleRateChange = (e) => {
    const rate = parseFloat(e.target.value);
    if (rate >= 0) {
      setDeductionRate(rate);
    } else {
      toast.error("Deduction rate must be a non-negative number.", {
        duration: 5000,
      });
    }
  };

  // Save deduction configuration
  const handleSaveDeductionConfiguration = async () => {
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
        toast.error("Failed to save deduction configuration.", {
          duration: 5000,
        });
      } else {
        toast.success("Deduction configuration saved successfully.", {
          duration: 5000,
        });
      }
    } catch (error) {
      toast.error(`Failed to save deduction configuration: ${error.message}`, {
        duration: 5000,
      });
    }
  };

  // Handle adding a new IP
  const handleAddIP = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/addAllowedIP", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ip: newIP }),
      });

      if (response.ok) {
        const data = await response.json();
        setAllowedIPs(data.allowedIPs);
        toast.success("IP added successfully.");
        setNewIP(""); // Clear input
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to add IP.");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  // Handle removing an IP
  const handleRemoveIP = async (ip) => {
    try {
      const response = await fetch(
        "http://localhost:5000/admin/removeAllowedIP",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ ip }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAllowedIPs(data.allowedIPs);
        toast.success("IP removed successfully.");
      } else {
        toast.error("Failed to remove IP.");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Configuration</h1>

        {/* Deduction Configuration Section */}
        <div className="mb-6 pb-6 border-b-4 border-black">
          <h2 className="text-lg font-semibold mb-4">
            Deduction Configuration
          </h2>
          <label className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={deductionsEnabled}
              onChange={handleToggleDeductions}
              className="form-checkbox"
            />
            <span>Enable Deductions</span>
          </label>
          {deductionsEnabled && (
            <div className="mt-4">
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
            onClick={handleSaveDeductionConfiguration}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Save Deduction Configuration
          </button>
        </div>

        {/* Allowed IP Configuration Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center justify-center">
            Router IP Configuration
          </h2>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">
              Add New Router IP
            </label>
            <input
              type="text"
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              placeholder="192.168.100.1"
              className="border px-3 py-2 rounded-lg w-full mb-2"
            />
            <button
              onClick={handleAddIP}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Add IP
            </button>
          </div>
          <h3 className="text-lg font-semibold mb-2">Allowed Router IPs</h3>
          <ul>
            {allowedIPs.map((ip, index) => (
              <li
                key={index}
                className="flex justify-between items-center mb-2 border-b"
              >
                <span>{ip}</span>
                <button
                  onClick={() => handleRemoveIP(ip)}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
