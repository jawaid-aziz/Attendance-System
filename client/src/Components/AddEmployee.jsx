import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import {
  SelectContent,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Loader2, UserPlus } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { API_URL } from "@/lib/config";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  salary: "",
  address: "",
  role: "employee",
};

const AddEmployeeForm = () => {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to add employee.", {
          duration: 5000,
        });
        return;
      }

      toast.success(
        "Employee added! A setup link was sent to their email.",
        { duration: 6000 }
      );
      setFormData(initialForm);
    } catch (error) {
      toast.error(
        error.message || "Failed to add employee. Please try again.",
        { duration: 5000 }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Add Employee
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create a team member and email them a one-time setup link.
          </p>
        </div>

        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="pb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Personal Information
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Enter address"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary (Rs.)</Label>
                  <Input
                    id="salary"
                    type="number"
                    min="0"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    required
                    placeholder="Enter monthly salary"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> Add Employee
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AddEmployeeForm;
