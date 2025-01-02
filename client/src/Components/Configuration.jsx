import React, { useState, useEffect } from "react";

export const Configuration = () => {
  const [deductionsEnabled, setDeductionsEnabled] = useState(false);
  const [deductionRate, setDeductionRate] = useState(0);

  // Fetch existing configuration on load
  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        const response = await fetch("http://localhost:5000/admin/getDeductions", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setDeductionsEnabled(data.deductionsEnabled);
          setDeductionRate(data.deductionRate);
        } else {
          console.error("Failed to fetch configuration");
        }
      } catch (error) {
        console.error("Error fetching configuration:", error);
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
      alert("Deduction rate must be a non-negative number.");
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/updateDeductions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          deductionsEnabled,
          deductionRate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save configuration.");
      }

      alert("Configuration saved successfully.");
    } catch (error) {
      console.error("Error saving configuration:", error);
      alert("An error occurred while saving the configuration.");
    }
  };

  return (
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
          <label className="block mb-2 text-gray-700 font-semibold">Deduction Rate (%):</label>
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
  );
};
// Configuration.jsx or your React component file
// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Switch } from "@/components/ui/switch";

// export const Configuration = () => {
//   const [deductionsEnabled, setDeductionsEnabled] = useState(false);
//   const [deductionRate, setDeductionRate] = useState(0);
//   const [loading, setLoading] = useState(false);

//   // Fetch current deductions settings from the backend
//   useEffect(() => {
//     const fetchDeductionsSettings = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/admin/getDeductions", {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//             "Content-Type": "application/json",
//           },
//         });

//         if (!response.ok) throw new Error("Failed to fetch deductions settings.");

//         const data = await response.json();
//         console.log("Fetched data:", data); // Debugging
//         setDeductionsEnabled(data.deductionsEnabled);
//         setDeductionRate(data.deductionRate);
//       } catch (error) {
//         console.error("Error fetching deductions settings:", error.message);
//         alert("Failed to load deductions settings.");
//       }
//     };

//     fetchDeductionsSettings();
//   }, []);

//   // Save the updated deductions settings
//   const saveDeductionsSettings = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch("http://localhost:5000/admin/updateDeductions", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({
//           deductionsEnabled,
//           deductionRate,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to save deductions settings.");
//       }

//       alert("Deductions settings updated successfully!");
//     } catch (error) {
//       console.error("Error saving deductions settings:", error.message);
//       alert(`Failed to update deductions settings: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-8">
//       <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
//         <h1 className="text-2xl font-bold mb-4">Manage Deductions</h1>
//         <div className="mb-4 flex items-center">
//           <Switch
//             checked={deductionsEnabled}
//             onChange={(value) => setDeductionsEnabled(value)}
//             label="Enable Deductions"
//           />
//         </div>
//         {deductionsEnabled && (
//           <div className="mb-4">
//             <Input
//               type="number"
//               label="Deduction Rate (%)"
//               value={deductionRate}
//               onChange={(e) => {
//                 const value = parseFloat(e.target.value);
//                 setDeductionRate(isNaN(value) ? 0 : value);
//               }}
//               min="0"
//               max="100"
//               step="0.01"
//             />
//           </div>
//         )}
//         <Button
//           onClick={saveDeductionsSettings}
//           disabled={loading || (deductionsEnabled && deductionRate <= 0)}
//           className="w-full"
//         >
//           {loading ? "Saving..." : "Save Settings"}
//         </Button>
//       </div>
//     </div>
//   );
// };
