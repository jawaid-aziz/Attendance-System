import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTargetUser } from "../hooks/useTargetUser";
import { slugifyName } from "@/lib/slugifyName";
import { API_URL } from "@/lib/config";
import { Progress } from "@/Components/ui/progress";
import { ScrollArea, ScrollBar } from "@/Components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/Components/ui/pagination";
import toast, { Toaster } from "react-hot-toast";

const AttendanceHistory = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { targetId, status } = useTargetUser();
  const [records, setRecords] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [summary, setSummary] = useState({
    totalDeductions: 0,
    monthlySalary: 0,
    netSalary: 0,
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(records.length / recordsPerPage));

  // Year and Month selectors
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Compute Paginated Records
  const paginatedRecords = records.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  useEffect(() => {
    if (!targetId) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/byId/getUser/${targetId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          toast.error("Failed to fetch user data", { duration: 5000 });
          return;
        }

        const data = await response.json();
        setFirstName(`for ${data.user.firstName}`);
        setLastName(data.user.lastName || "");
      } catch (err) {
        toast.error(err.message, { duration: 5000 });
      }
    };

    fetchUser();
  }, [targetId]);

  // Show whose attendance is being viewed as a name slug in the address bar.
  useEffect(() => {
    if (!name && firstName && targetId) {
      const nameSlug = slugifyName(firstName.replace(/^for /, ""), lastName);
      if (nameSlug) {
        const slug = localStorage.getItem("slug");
        const base = slug ? `/${slug}` : "";
        navigate(`${base}/attendance-history/${nameSlug}`, {
          replace: true,
          state: { userId: targetId },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, firstName, lastName, targetId]);

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 5 : prev));
    }, 100);

    try {
      const params = new URLSearchParams({
        year: String(selectedYear),
        month: String(selectedMonth),
      });
      const response = await fetch(
        `${API_URL}/attend/records/${targetId}?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        toast.error(`Failed to fetch attendance records.`);
        return;
      }
      const data = await response.json();
      setRecords(data.records || []);
      setAvailableYears(data.availableYears || []);
      setSummary({
        totalDeductions: data.totalDeductions || 0,
        monthlySalary: data.monthlySalary || 0,
        netSalary: data.netSalary || 0,
      });
      setCurrentPage(1);
    } catch (err) {
      toast.error(err.message, { duration: 5000 });
    } finally {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    if (!targetId) return;
    fetchAttendanceRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, selectedYear, selectedMonth]);

  const formatDate = (dateString, options) => {
    if (!dateString) return "Not Available";
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const generateYearOptions = () => {
    if (!availableYears.length) return [];
    const currentYear = new Date().getFullYear();
    const earliestYear = Math.min(...availableYears);
    const yearOptions = [];
    for (let year = earliestYear; year <= currentYear; year++) {
      yearOptions.push(year);
    }
    return yearOptions;
  };

  if (status === "error") {
    return (
      <>
        <Toaster position="bottom-right" reverseOrder={false} />
        <p className="p-6 text-red-600">User not found.</p>
      </>
    );
  }

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

        {!loading && records.length > 0 ? (
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
                        {formatDate(record.date || record.checkIn, {
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
                        {record.deductions ? `Rs. ${record.deductions}` : "0"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {summary.monthlySalary > 0 && (
              <div className="mt-4 p-3 rounded-md border bg-gray-50 text-sm">
                <p>
                  Monthly salary: <strong>Rs. {summary.monthlySalary}</strong>
                </p>
                <p>
                  Deductions: <strong>Rs. {summary.totalDeductions}</strong>
                </p>
                <p>
                  Net payable: <strong>Rs. {summary.netSalary}</strong>
                </p>
              </div>
            )}

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
