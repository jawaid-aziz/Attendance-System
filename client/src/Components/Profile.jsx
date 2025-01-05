import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRole } from "../Context/RoleProvider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Profile = () => {
  const { id } = useParams();
  const { role } = useRole();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    phone: "",
    address: "",
    salary: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 5 : prev));
      }, 100);

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
        setFormData({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          email: data.user.email || "",
          role: data.user.role || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          salary: data.user.salary || "",
        });
        setError(null);
      } catch (err) {
        setError(err.message);
        setFormData({ ...formData, firstName: "No data" }); // Fallback if error
      } finally {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchUser();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sanitizedFormData = {
        ...formData,
        salary: Number(formData.salary) || 0, // Ensure salary is a valid number
      };

      const response = await fetch(`http://localhost:5000/admin/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(sanitizedFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user data");
      }

    } catch (err) {
      console.error("Error updating user data:", err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-gray-500 mt-2">Loading...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <Card className="w-full md:w-3/4 lg:w-2/3 mx-auto mt-6">
      <CardHeader>
        <h1 className="text-2xl font-semibold">Profile</h1>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">First Name</label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  readOnly={role !== "admin"}
                  className={role !== "admin" ? "bg-cornflower-blue-100" : ""}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Last Name</label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  readOnly={role !== "admin"}
                  className={role !== "admin" ? "bg-cornflower-blue-100" : ""}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <Input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  readOnly={role !== "admin"}
                  className={role !== "admin" ? "bg-cornflower-blue-100" : ""}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly={role !== "admin"}
                  className={role !== "admin" ? "bg-cornflower-blue-100" : ""}
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Address</label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                readOnly={role !== "admin"}
                className={role !== "admin" ? "bg-cornflower-blue-100" : ""}
              />
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700">Professional Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Role</label>
                {role === "admin" ? (
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input type="text" name="role" value={formData.role} readOnly className={role !== "admin" ? "bg-cornflower-blue-100" : ""} />
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">Salary</label>
                <Input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  readOnly={role !== "admin"}
                  className={role !== "admin" ? "bg-cornflower-blue-100" : ""}
                />
              </div>
            </div>
          </div>

          {role === "admin" && (
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
