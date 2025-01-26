// import React, { useState, useEffect } from "react";
// import toast, { Toaster } from "react-hot-toast";

// export const OfficeTimings = () => {
//   const [timings, setTimings] = useState([]);
//   const [dayOff, setDayOff] = useState({});

//   // Fetch configuration from the backend
//   useEffect(() => {
//     const fetchOfficeTimings = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/admin/getOfficeTimings", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });
//         if (response.ok) {
//           const data = await response.json();
//           setTimings(data.timings);
//           setDayOff(data.dayOff);
//         } else {
//           toast.error("Failed to fetch office timings.");
//         }
//       } catch (error) {
//         toast.error(`Error: ${error.message}`);
//       }
//     };

//     fetchOfficeTimings();
//   }, []);

//   const handleToggleDay = (day) => {
//     setDayOff((prev) => ({ ...prev, [day]: !prev[day] }));
//   };

//   const handleTimeChange = (day, type, value) => {
//     setTimings((prev) =>
//       prev.map((entry) =>
//         entry.day === day ? { ...entry, [type]: value } : entry
//       )
//     );
//   };

//   const handleSave = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/admin/updateOfficeTimings", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({ timings, dayOff }),
//       });

//       if (response.ok) {
//         toast.success("Office timings updated successfully.");
//       } else {
//         toast.error("Failed to save office timings.");
//       }
//     } catch (error) {
//       toast.error(`Error: ${error.message}`);
//     }
//   };

//   return (
//     <>
//       <Toaster position="bottom-right" />
//       <div className="p-4">
//         <h1 className="text-2xl font-bold mb-4">Configure Office Timings</h1>
//         <div className="mb-4">
//           {timings.map((entry, index) => (
//             <div key={index} className="mb-4">
//               <label className="flex items-center space-x-4 mb-2">
//                 <input
//                   type="checkbox"
//                   checked={!dayOff[entry.day]}
//                   onChange={() => handleToggleDay(entry.day)}
//                 />
//                 <span>{entry.day}</span>
//               </label>
//               {!dayOff[entry.day] && (
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block mb-1">Start Time</label>
//                     <input
//                       type="time"
//                       value={entry.startTime}
//                       onChange={(e) => handleTimeChange(entry.day, "startTime", e.target.value)}
//                       className="border px-3 py-2 rounded-lg w-full"
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1">End Time</label>
//                     <input
//                       type="time"
//                       value={entry.endTime}
//                       onChange={(e) => handleTimeChange(entry.day, "endTime", e.target.value)}
//                       className="border px-3 py-2 rounded-lg w-full"
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//         <button
//           onClick={handleSave}
//           className="px-6 py-2 bg-blue-600 text-white rounded-lg"
//         >
//           Save Configuration
//         </button>
//       </div>
//     </>
//   );
// };
// File: src/components/AdminPanel.jsx
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

const OfficeTimings = () => {
  // Initial state with 7 days (Monday to Sunday)
  const [officeSchedule, setOfficeSchedule] = useState({
    Monday: { isOpen: true, startTime: "09:00", endTime: "17:00" },
    Tuesday: { isOpen: true, startTime: "09:00", endTime: "17:00" },
    Wednesday: { isOpen: true, startTime: "09:00", endTime: "17:00" },
    Thursday: { isOpen: true, startTime: "09:00", endTime: "17:00" },
    Friday: { isOpen: true, startTime: "09:00", endTime: "17:00" },
    Saturday: { isOpen: false, startTime: "09:00", endTime: "17:00" },
    Sunday: { isOpen: false, startTime: "09:00", endTime: "17:00" },
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch the office schedule from the server on component mount
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/admin/getOfficeTiming",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched office schedule:", data);

          const filteredSchedule = daysOfWeek.reduce((acc, day) => {
            acc[day] = data[day] || officeSchedule[day];
            return acc;
          }, {});

          setOfficeSchedule(filteredSchedule);
        } else {
          console.error("Failed to fetch office schedule. Status:", response.status);
          toast.error("Failed to fetch office schedule.");
        }
      } catch (error) {
        console.error("Error fetching office schedule:", error.message);
        toast.error(`Error fetching office schedule: ${error.message}`);
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
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/admin/saveOfficeTiming", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schedule: officeSchedule }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Save schedule response:", data);
        toast.success(data.message || "Office schedule saved successfully.");
      } else {
        const errorData = await response.json();
        console.error("Failed to save schedule. Error:", errorData);
        toast.error(errorData.message || "Failed to save office schedule.");
      }
    } catch (error) {
      console.error("Error saving office schedule:", error.message);
      toast.error(`Error saving office schedule: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Toaster position="bottom-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold text-center mb-6">Configure Office Timings</h1>
      <form>
        <div className="space-y-6">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex items-center justify-between p-4 border rounded-lg shadow-md">
              <span className="font-semibold text-lg capitalize">{day}</span>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={officeSchedule[day]?.isOpen || false}
                  onChange={() => handleToggle(day)}
                  className="mr-2"
                />
                {officeSchedule[day]?.isOpen ? "Open" : "Closed"}
              </label>
              {officeSchedule[day]?.isOpen && (
                <div className="space-x-4">
                  <input
                    type="time"
                    value={officeSchedule[day]?.startTime || ""}
                    onChange={(e) => handleTimeChange(day, "startTime", e.target.value)}
                    className="border p-2 rounded-md"
                  />
                  <input
                    type="time"
                    value={officeSchedule[day]?.endTime || ""}
                    onChange={(e) => handleTimeChange(day, "endTime", e.target.value)}
                    className="border p-2 rounded-md"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleSave}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
          >
            Save Schedule
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfficeTimings;


