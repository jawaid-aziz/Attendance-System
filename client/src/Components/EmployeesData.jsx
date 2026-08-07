import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/Components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import { Skeleton } from "@/Components/ui/skeleton";
import toast, { Toaster } from "react-hot-toast";
import { slugifyName } from "@/lib/slugifyName";
import { API_URL } from "@/lib/config";
import { Users, UserPlus, Search, UserCheck } from "lucide-react";

const roleBadge = {
  admin: "bg-cornflower-blue-50 text-cornflower-blue-700",
  employee: "bg-slate-100 text-slate-600",
};

const initialsFor = (firstName, lastName) =>
  `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase();

const EmployeesData = () => {
  const [employees, setEmployees] = useState([]);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const apiUrl = API_URL;
  const navigate = useNavigate();
  const base = localStorage.getItem("slug")
    ? `/${localStorage.getItem("slug")}`
    : "";

  useEffect(() => {
    let active = true;

    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${apiUrl}/admin/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        if (active) {
          setEmployees(data.employees || []);
          setLoading(false);
        }
      } catch {
        if (active) {
          toast.error("Failed to fetch employee data", { duration: 5000 });
          setLoading(false);
        }
      }
    };

    fetchEmployees();

    const pollInterval = setInterval(fetchEmployees, 15000);

    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, [apiUrl]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const role = String(employee.role || "").toLowerCase();
      return fullName.includes(q) || role.includes(q);
    });
  }, [employees, search]);

  const activeCount = employees.filter((e) => e.isActive).length;
  const inactiveCount = employees.length - activeCount;

  const handleViewProfile = (employee) => {
    const nameSlug = slugifyName(employee.firstName, employee.lastName);
    navigate(`${base}/profile/${nameSlug || "user"}`, {
      state: { userId: employee._id },
    });
  };

  const handleViewAttendance = (employee) => {
    const nameSlug = slugifyName(employee.firstName, employee.lastName);
    navigate(`${base}/attendance-history/${nameSlug || "user"}`, {
      state: { userId: employee._id },
    });
  };

  const openDeleteDialog = (employee) => {
    setEmployeeToDelete(employee);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `${apiUrl}/admin/delete/${employeeToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        toast.error("Failed to delete employee");
      } else {
        toast.success("Employee deleted");
        setEmployees((prev) =>
          prev.filter((e) => e._id !== employeeToDelete._id)
        );
      }
    } catch {
      toast.error("Error deleting employee");
    } finally {
      setDeleting(false);
      setEmployeeToDelete(null);
    }
  };

  const stat = (label, value, icon, tone) => (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Employees
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your team and their attendance.
            </p>
          </div>
          <Button onClick={() => navigate(`${base}/add-employee`)}>
            <UserPlus className="h-4 w-4" /> Add Employee
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {stat(
            "Total Employees",
            employees.length,
            <Users className="h-5 w-5" />,
            "bg-cornflower-blue-50 text-cornflower-blue-600"
          )}
          {stat(
            "Active Today",
            activeCount,
            <UserCheck className="h-5 w-5" />,
            "bg-green-50 text-green-600"
          )}
          {stat(
            "Inactive Today",
            inactiveCount,
            <UserCheck className="h-5 w-5" />,
            "bg-slate-100 text-slate-600"
          )}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or role…"
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const {
                    _id,
                    firstName = "Unknown",
                    lastName = "Unknown",
                    role = "Unknown",
                    isActive,
                  } = employee;

                  return (
                    <TableRow key={_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-cornflower-blue-100 text-xs font-semibold text-cornflower-blue-700">
                              {initialsFor(firstName, lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <button
                              onClick={() => handleViewProfile(employee)}
                              className="font-medium text-slate-900 hover:text-cornflower-blue-700 hover:underline"
                            >
                              {firstName} {lastName}
                            </button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={roleBadge[role] || "bg-slate-100 text-slate-600"}
                        >
                          {role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }
                        >
                          {isActive ? "Active" : "Not checked in"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAttendance(employee)}
                          >
                            Attendance
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  openDeleteDialog({ _id, firstName, lastName })
                                }
                              >
                                Delete
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete {employeeToDelete?.firstName}{" "}
                                  {employeeToDelete?.lastName}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. The employee
                                  will be permanently removed from the database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => setEmployeeToDelete(null)}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  disabled={deleting}
                                  onClick={confirmDelete}
                                >
                                  {deleting ? "Deleting..." : "Yes, Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredEmployees.length === 0 && (
              <div className="px-6 py-16 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No employees found
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {search
                    ? "Try a different search term."
                    : "Add your first employee to get started."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeesData;
