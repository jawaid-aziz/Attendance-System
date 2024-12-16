import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AttendanceHistory = () => {
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/attend/records/${id}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch attendance records: ${response.status}`
        );
      }
      const data = await response.json();
      setRecords(data.records || []);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Ensure loading is set to false
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance Records</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {records.length > 0 ? (
        <table className="table-auto border-collapse border border-gray-400 w-full text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-4 py-2">Name</th>
              <th className="border border-gray-400 px-4 py-2">Check-In</th>
              <th className="border border-gray-400 px-4 py-2">Check-Out</th>
              <th className="border border-gray-400 px-4 py-2">Status</th>
              <th className="border border-gray-400 px-4 py-2">Deductions</th>
              <th className="border border-gray-400 px-4 py-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index}>
                <td className="border border-gray-400 px-4 py-2">
                  {record.firstName}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {formatDate(record.checkIn)}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {formatDate(record.checkOut)}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {record.checkInstatus}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {record.deductions}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {record.isActive ? "Active" : "Inactive"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No attendance records found.</p>
      )}
    </div>
  );
};

export default AttendanceHistory;
