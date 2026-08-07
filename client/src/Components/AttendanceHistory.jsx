import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTargetUser } from "../hooks/useTargetUser";
import { slugifyName } from "@/lib/slugifyName";
import { API_URL } from "@/lib/config";
import { Skeleton } from "@/Components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/Components/ui/scroll-area";
import {
  Table,
  TableBody,
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
import { Badge } from "@/Components/ui/badge";
import { Coins, Wallet, TrendingUp } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const statusBadge = {
  late: "bg-amber-100 text-amber-700",
  "on-time": "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  "not-checked-out": "bg-slate-100 text-slate-600",
};

const badgeForStatus = (status) => {
  const key = String(status || "").toLowerCase();
  const known = statusBadge[key];
  if (known) return { label: status, className: known };
  if (key.includes("late")) return { label: status, className: statusBadge.late };
  if (key.includes("absent")) return { label: status, className: statusBadge.absent };
  return { label: status, className: statusBadge["on-time"] };
};

const STATUS_META = {
  "in-office": { label: "In office", className: "bg-green-100 text-green-700" },
  late: { label: "Late", className: "bg-amber-100 text-amber-700" },
  "checked-out": { label: "Checked out", className: "bg-slate-100 text-slate-600" },
  "not-checked-in": {
    label: "Not checked in",
    className: "bg-red-50 text-red-600",
  },
  absent: { label: "Absent", className: "bg-red-100 text-red-700" },
};

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
      setLoading(false);
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

  const presentDays = records.filter((r) => r.checkIn).length;

  if (status === "error") {
    return (
      <>
        <Toaster position="bottom-right" reverseOrder={false} />
        <p className="p-6 text-red-600">User not found.</p>
      </>
    );
  }

  const summaryCards = [
    {
      label: "Monthly Salary",
      value: summary.monthlySalary,
      icon: <Wallet className="h-5 w-5" />,
      tone: "bg-cornflower-blue-50 text-cornflower-blue-600",
    },
    {
      label: "Deductions",
      value: summary.totalDeductions,
      icon: <Coins className="h-5 w-5" />,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Net Payable",
      value: summary.netSalary,
      icon: <TrendingUp className="h-5 w-5" />,
      tone: "bg-green-50 text-green-600",
    },
  ];

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Attendance Records {firstName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Daily check-ins, check-outs and deductions.
            </p>
          </div>

          <div className="flex gap-3">
            <Select
              onValueChange={(value) => setSelectedYear(Number(value))}
              value={selectedYear.toString()}
            >
              <SelectTrigger className="w-[130px]">
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
              value={selectedMonth.toString()}
            >
              <SelectTrigger className="w-[150px]">
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
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-24 rounded-2xl bg-slate-100" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-2xl bg-slate-100" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
                  >
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      {card.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      Rs. {(Number(card.value) || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {records.length > 0 ? (
              <>
                <ScrollArea className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Date</TableHead>
                        <TableHead>Check-In</TableHead>
                        <TableHead>Check-Out</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Deductions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRecords.map((record, index) => {
                        const badge = badgeForStatus(record.checkInstatus);
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {formatDate(record.date || record.checkIn, {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
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
                            <TableCell>
                              <Badge
                                className={
                                  STATUS_META[String(record.checkInstatus || "")
                                    .toLowerCase()]?.className ||
                                  badge.className
                                }
                              >
                                {badge.label || record.checkInstatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {record.deductions
                                ? `Rs. ${record.deductions}`
                                : "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>

                {presentDays > 0 && totalPages > 1 && (
                  <div className="flex justify-center">
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
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                        />
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
                <p className="text-sm font-medium text-slate-600">
                  No attendance records found
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Try a different month or year.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AttendanceHistory;
