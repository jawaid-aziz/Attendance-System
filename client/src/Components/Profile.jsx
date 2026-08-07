import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRole } from "../Context/RoleProvider";
import { useId } from "../Context/IdProvider";
import { useTargetUser } from "../hooks/useTargetUser";
import { slugifyName } from "@/lib/slugifyName";
import { API_URL } from "@/lib/config";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Skeleton } from "@/Components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Loader2, Save, Lock, Pencil } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const initialsFor = (firstName, lastName) =>
  `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase();

export const Profile = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { role } = useRole();
  const { id: ownId } = useId();
  const { targetId, status } = useTargetUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwSubmitting, setPwSubmitting] = useState(false);

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
    if (!targetId) return;

    const fetchUser = async () => {
      setLoading(true);

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
        setFormData({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          email: data.user.email || "",
          role: data.user.role || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          salary: data.user.salary || "",
        });
      } catch (err) {
        toast.error(err.message, { duration: 5000 });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [targetId]);

  // Keep the address bar readable: show whose profile is being viewed as a
  // "first-last" name slug instead of any raw id.
  useEffect(() => {
    if (!name && formData.firstName) {
      const nameSlug = slugifyName(formData.firstName, formData.lastName);
      if (nameSlug) {
        const slug = localStorage.getItem("slug");
        const base = slug ? `/${slug}` : "";
        navigate(`${base}/profile/${nameSlug}`, {
          replace: true,
          state: { userId: targetId },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, formData.firstName, formData.lastName, targetId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const sanitizedFormData = {
        ...formData,
        salary: Number(formData.salary) || 0, // Ensure salary is a valid number
      };

      const response = await fetch(`${API_URL}/admin/edit/${targetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(sanitizedFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update user data", { duration: 5000 });
        return;
      }

      toast.success("User data updated successfully!", { duration: 5000 });
    } catch (err) {
      toast.error(err.message, { duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match", { duration: 5000 });
      return;
    }
    setPwSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "Failed to update password", { duration: 5000 });
        return;
      }
      toast.success(data.message || "Password updated successfully!", { duration: 5000 });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.message, { duration: 5000 });
    } finally {
      setPwSubmitting(false);
    }
  };

  if (status === "error") {
    return <p className="p-6 text-red-600">User not found.</p>;
  }

  const isOwnProfile = targetId === ownId;
  const readOnly = role !== "admin";
  const sectionTitle = (icon, text) => (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-lg font-semibold text-slate-900">{text}</h2>
    </div>
  );

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 rounded-2xl bg-slate-100" />
            <Skeleton className="h-72 rounded-2xl bg-slate-100" />
            {isOwnProfile && (
              <Skeleton className="h-72 rounded-2xl bg-slate-100" />
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-cornflower-blue-100 text-xl font-semibold text-cornflower-blue-700">
                  {initialsFor(formData.firstName, formData.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
                  {formData.firstName} {formData.lastName}
                </h1>
                <p className="truncate text-sm text-slate-500">
                  {formData.email}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={
                      formData.role === "admin"
                        ? "bg-cornflower-blue-50 text-cornflower-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }
                  >
                    {formData.role}
                  </Badge>
                  {readOnly && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Pencil className="h-3 w-3" /> Read-only view
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Card className="rounded-2xl border-slate-100 shadow-sm">
              <CardHeader className="pb-4">
                {sectionTitle(<Pencil className="h-5 w-5 text-cornflower-blue-600" />, "Personal Information")}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        readOnly={readOnly}
                        className={readOnly ? "bg-slate-50 text-slate-600" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        readOnly={readOnly}
                        className={readOnly ? "bg-slate-50 text-slate-600" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        readOnly={readOnly}
                        className={readOnly ? "bg-slate-50 text-slate-600" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        readOnly={readOnly}
                        className={readOnly ? "bg-slate-50 text-slate-600" : ""}
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
                      onChange={handleInputChange}
                      readOnly={readOnly}
                      className={readOnly ? "bg-slate-50 text-slate-600" : ""}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      {readOnly ? (
                        <Input
                          id="role"
                          type="text"
                          name="role"
                          value={formData.role}
                          readOnly
                          className="bg-slate-50 text-slate-600"
                        />
                      ) : (
                        <Select
                          value={formData.role}
                          onValueChange={handleRoleChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary (Rs.)</Label>
                      <Input
                        id="salary"
                        type="text"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        readOnly={readOnly}
                        className={readOnly ? "bg-slate-50 text-slate-600" : ""}
                      />
                    </div>
                  </div>

                  {role === "admin" && (
                    <Button type="submit" className="w-full" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" /> Save Changes
                        </>
                      )}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {isOwnProfile && (
              <Card className="rounded-2xl border-slate-100 shadow-sm">
                <CardHeader className="pb-4">
                  {sectionTitle(<Lock className="h-5 w-5 text-cornflower-blue-600" />, "Change Password")}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        name="currentPassword"
                        value={pwForm.currentPassword}
                        onChange={(e) =>
                          setPwForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          name="newPassword"
                          value={pwForm.newPassword}
                          onChange={(e) =>
                            setPwForm((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          placeholder="At least 6 characters"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          name="confirmPassword"
                          value={pwForm.confirmPassword}
                          onChange={(e) =>
                            setPwForm((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={pwSubmitting}
                      className="w-full"
                    >
                      {pwSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
};
