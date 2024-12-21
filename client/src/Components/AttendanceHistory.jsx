import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Progress } from "@/components/ui/progress"; // Adjust the path as per your project setup
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Adjust the path as per your project setup

const AttendanceHistory = () => {
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [firstName, setFirstName] = useState(null); // Default is null to differentiate loading

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 5 : prev));
    }, 100);

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
      if (data.records?.length > 0) {
        setFirstName(data.records[0].firstName); // Update only when records are available
      } else {
        setFirstName("No records");
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      setFirstName("No records"); // Fallback in case of error
    } finally {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setLoading(false), 500);
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
      <h1 className="text-2xl font-bold mb-4">
        Attendance Records for {firstName}
      </h1>

      {loading && (
        <div className="w-full my-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">{progress}% Loading records...</p>
        </div>
      )}

      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && records.length > 0 ? (
        <Table className="w-full">
          <TableCaption>Attendance details for the selected employee.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Check-In</TableHead>
              <TableHead>Check-Out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deductions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.firstName}</TableCell>
                <TableCell>{formatDate(record.checkIn)}</TableCell>
                <TableCell>{formatDate(record.checkOut)}</TableCell>
                <TableCell>{record.checkInstatus}</TableCell>
                <TableCell>{record.deductions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        !loading && <p>No attendance records found.</p>
      )}
    </div>
  );
};

export default AttendanceHistory;
