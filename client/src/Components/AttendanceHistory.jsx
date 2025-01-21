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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import toast, { Toaster } from "react-hot-toast";

const AttendanceHistory = () => {
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [firstName, setFirstName] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const [deduction, setDeduction] = useState();

  // Year and Month selectors
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Compute Paginated Records
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/byId/getUser/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          toast.error("Failed to fetch user data", { duration: 5000 });
        }

        const data = await response.json();
        setFirstName(`for ${data.user.firstName}`);
      } catch (err) {
        toast.error(err.message, { duration: 5000 });
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
        toast.error(`Failed to fetch attendance records.`);
      }
      const data = await response.json();
      console.log(data.records);
      setRecords(data.records || []);
      setFilteredRecords(data.records || []);
    } catch (err) {
      toast.error(err.message, { duration: 5000 });
    } finally {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  useEffect(() => {
    // Filter records based on selected year and month
    const filtered = records.filter((record) => {
      const recordDate = new Date(record.checkIn);
      return (
        recordDate.getFullYear() === selectedYear &&
        recordDate.getMonth() + 1 === selectedMonth
      );
    });
    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [selectedYear, selectedMonth, records]);

  const formatDate = (dateString, options) => {
    if (!dateString) return "Not Available";
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const generateYearOptions = () => {
    if (!records.length) return [];

    // Extract valid years from the `checkIn` field
    const years = records
      .map((record) => {
        const date = new Date(record.date);
        return date instanceof Date && !isNaN(date) ? date.getFullYear() : null;
      })
      .filter((year) => year !== null); // Remove invalid years

    if (!years.length) return [];

    const earliestYear = Math.min(...years); // Find the earliest valid year
    const currentYear = new Date().getFullYear();

    // Generate years from the earliest year to the current year + 1
    const yearOptions = [];
    for (let year = earliestYear; year <= currentYear; year++) {
      yearOptions.push(year);
    }

    return yearOptions;
  };

  const roundDownToOneDecimalPlace = (number) => {
    return Math.floor(number * 10) / 10;
  };

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">
          Attendance Records {firstName}
        </h1>

        <div className="flex gap-4 mb-4">
          <Select
            onValueChange={(value) => setSelectedYear(Number(value))}
            defaultValue={selectedYear.toString()}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a year" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Year</SelectLabel>
                {generateYearOptions().map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => setSelectedMonth(Number(value))}
            defaultValue={selectedMonth.toString()}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Month</SelectLabel>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {new Date(0, month - 1).toLocaleString(undefined, {
                      month: "long",
                    })}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {loading && (
          <div className="w-full my-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">Loading...</p>
          </div>
        )}

        {!loading && filteredRecords.length > 0 ? (
          <>
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
                  {paginatedRecords.map((record, index) => (
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
                      <TableCell>
                        {roundDownToOneDecimalPlace(record.deductions)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent className="cursor-pointer">
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  />
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  />
                </PaginationContent>
              </Pagination>
            </div>
          </>
        ) : (
          !loading && <p>No attendance records found for the selected date.</p>
        )}
      </div>
    </>
  );
};

export default AttendanceHistory;
