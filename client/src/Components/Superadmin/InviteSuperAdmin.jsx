import { useEffect, useState } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Skeleton } from "@/Components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Loader2, Send, ShieldCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { API_URL } from "@/lib/config";

const apiUrl = API_URL;
const token = () => localStorage.getItem("token");

const initialsFor = (firstName, lastName) =>
  `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase();

const InviteSuperAdmin = () => {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [superAdmins, setSuperAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${apiUrl}/superadmin/admins`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSuperAdmins(data.superAdmins || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/superadmin/invite-superadmin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to invite");
      toast.success("Invitation sent. They will receive a setup link by email.");
      setForm({ firstName: "", lastName: "", email: "" });
      fetchAdmins();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Invite Super Admin
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Grant another user platform-wide super admin access.
          </p>
        </div>

        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-cornflower-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                New Invitation
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Invitation
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cornflower-blue-600" />
              <CardTitle className="text-lg">Super Admins</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : superAdmins.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No super admins yet
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Invite your first super admin to get started.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {superAdmins.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-cornflower-blue-100 text-xs font-semibold text-cornflower-blue-700">
                              {initialsFor(u.firstName, u.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-slate-900">
                            {`${u.firstName} ${u.lastName}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default InviteSuperAdmin;
