import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

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
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Configuration</h1>
  
        {/* Deduction Configuration Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deduction Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={deductionsEnabled}
                onCheckedChange={handleToggleDeductions}
              />
              <span>Enable Deductions</span>
            </div>
            {deductionsEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deduction Rate (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={deductionRate}
                  onChange={handleRateChange}
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveDeductionConfiguration}>
              Save Deduction Configuration
            </Button>
          </CardFooter>
        </Card>
  
        {/* Allowed IP Configuration Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Router IP Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add New Router IP
              </label>
              <Input
                type="text"
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                placeholder="192.168.100.1"
              />
              <Button
                variant="secondary"
                className="mt-2"
                onClick={handleAddIP}
              >
                Add IP
              </Button>
            </div>
            <div>
              <h3 className="text-md font-semibold mb-2">Allowed Router IPs</h3>
              <ul className="space-y-2">
                {allowedIPs.map((ip, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-100 p-2 rounded"
                  >
                    <span>{ip}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveIP(ip)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
