import React, { useState, useEffect } from "react"; 
import { useParams } from "react-router-dom";
import { useRole } from "../Context/RoleProvider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating user data:", err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-gray-500 mt-2">{progress}% Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <Card className="w-full md:w-1/2 mx-auto">
      <CardHeader>
        <h1 className="text-2xl font-bold">Profile</h1>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">First Name</label>
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              readOnly={role !== "admin"}
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
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Role</label>
            <Input
              type="text"
              name="role"
              value={formData.role}
              readOnly
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
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Address</label>
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              readOnly={role !== "admin"}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Salary</label>
            <Input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              readOnly={role !== "admin"}
            />
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
