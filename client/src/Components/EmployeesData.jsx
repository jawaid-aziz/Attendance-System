import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";

import { Badge } from "@/components/ui/badge";
import toast, { Toaster } from "react-hot-toast";

const EmployeesData = () => {
  const [employees, setEmployees] = useState([]);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const socketUrl = "http://localhost:5000"; // Backend URL
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate progress during data fetch
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 5 : prev));
    }, 100);

    // Fetch initial employee data
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${socketUrl}/admin/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();
        setEmployees(data.employees);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch employee data", { duration: 5000 });
        setLoading(false);
      } finally {
        clearInterval(interval);
        setProgress(100);
      }
    };

    fetchEmployees();

    // Initialize WebSocket connection
    const socket = io(socketUrl);

    // Listen for status updates
    socket.on("status update", (data) => {
      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) => {
          if (employee._id === data.employeeId) {
            return { ...employee, isActive: data.isActive };
          }
          return employee;
        })
      );
    });

    // Cleanup WebSocket connection on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleViewProfile = (id) => {
    navigate(`/profile/${id}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-gray-500 mt-2">Loading...</p>
      </div>
    );
  }

  const openDeleteDialog = (employee) => {
    setEmployeeToDelete(employee);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `${socketUrl}/admin/delete/${employeeToDelete._id}`,
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
    } catch (err) {
      toast.error("Error deleting employee");
    } finally {
      setDeleting(false);
      setEmployeeToDelete(null);
    }
  };

  const handleViewAttendance = (id) => {
    navigate(`/attendance-history/${id}`);
  };

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="container mx-auto p-6">
        <div className="overflow-x-auto">
          <Table className="bg-white shadow-sm rounded-md">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Actions</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
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
                      <div className="font-medium text-gray-800">{`${firstName} ${lastName}`}</div>
                    </TableCell>
                    <TableCell className="text-gray-600">{role}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewProfile(_id)}
                        >
                          View Profile
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
                                This action cannot be undone. The employee will
                                be permanently removed from the database.
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

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAttendance(_id)}
                        >
                          Attendance
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default EmployeesData;
