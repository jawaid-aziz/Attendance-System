import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AttendanceHistory = () => {
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:5000/byId/getUser/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setFirstName(`for ${data.user.firstName}`);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUser();
  }, [id]);

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
          `Failed to fetch attendance records.`
        );
      }
      const data = await response.json();
      setRecords(data.records || []);
      console.log(data.records);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const formatDate = (dateString, options) => {
    if (!dateString) return "Not Available";
    return new Date(dateString).toLocaleString(undefined, options);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Attendance Records {firstName}
      </h1>

      {loading && (
        <div className="w-full my-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">
            Loading...
          </p>
        </div>
      )}

      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && records.length > 0 ? (
        <ScrollArea className="rounded-md border p-4">
          <Table className="w-full">
            <TableCaption>
              Attendance details for the selected employee.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deductions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {formatDate(record.checkIn, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {formatDate(record.checkIn, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    {formatDate(record.checkOut, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>{record.checkInstatus}</TableCell>
                  <TableCell>{record.deductions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        !loading && <p>No attendance records found.</p>
      )}
    </div>
  );
};

export default AttendanceHistory;
