import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/Components/ui/select";
import { Skeleton } from "@/Components/ui/skeleton";
import { Search, Copy, Building2, Plus } from "lucide-react";
import timezoneData from "../../Data/Timezones.json";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";
import toast, { Toaster } from "react-hot-toast";
import { API_URL } from "@/lib/config";

const apiUrl = API_URL;
const token = () => localStorage.getItem("token");

const timezones = [
  {
    value: "Asia/Karachi",
    text: "(UTC+05:00) Islamabad, Karachi",
  },
  ...timezoneData.map((tz) => ({ value: tz.utc[0], text: tz.text })),
];

const emptyForm = {
  name: "",
  slug: "",
  totalEmployees: "",
  timezone: "Asia/Karachi",
  adminFirstName: "",
  adminLastName: "",
  adminEmail: "",
};

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(null);
  const [createdLink, setCreatedLink] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${apiUrl}/superadmin/companies`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (e) {
      toast.error(e.message || "Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleStatus = async (id, status) => {
    setTogglingStatus(id);
    try {
      const res = await fetch(`${apiUrl}/superadmin/companies/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Company ${status}`);
      fetchCompanies();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setTogglingStatus(null);
    }
  };

  const handleDelete = async () => {
    if (!companyToDelete) return;
    try {
      const res = await fetch(`${apiUrl}/superadmin/companies/${companyToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed to delete company");
      toast.success("Company deleted");
      setCompanyToDelete(null);
      fetchCompanies();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/superadmin/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          totalEmployees: form.totalEmployees ? Number(form.totalEmployees) : 0,
          timezone: form.timezone,
          adminFirstName: form.adminFirstName,
          adminLastName: form.adminLastName,
          adminEmail: form.adminEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create company");
      toast.success(data.message || "Company created");
      setCreatedLink(data.admin?.setupLink || "");
      setForm(emptyForm);
      setCreateOpen(false);
      fetchCompanies();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const activeCount = companies.filter((c) => c.status === "active").length;

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies.filter((c) => {
      const matchesStatus =
        statusFilter === "all" || c.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        String(c.adminName || "").toLowerCase().includes(q) ||
        String(c.adminEmail || "").toLowerCase().includes(q)
      );
    });
  }, [companies, search, statusFilter]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <Skeleton className="h-20 w-64 bg-slate-100" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-slate-100" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Companies
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage workspaces on the platform.
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Create Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Company</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="grid gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (optional)</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated from name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Employees</Label>
                  <Input
                    type="number"
                    value={form.totalEmployees}
                    onChange={(e) => setForm({ ...form, totalEmployees: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={form.timezone}
                    onValueChange={(v) => setForm({ ...form, timezone: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Timezone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {timezones.map((tz, i) => (
                        <SelectItem key={i} value={tz.value}>
                          {tz.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-2">Company Admin (optional)</p>
                  <div className="grid gap-3">
                    <Input
                      placeholder="Admin first name"
                      value={form.adminFirstName}
                      onChange={(e) => setForm({ ...form, adminFirstName: e.target.value })}
                    />
                    <Input
                      placeholder="Admin last name"
                      value={form.adminLastName}
                      onChange={(e) => setForm({ ...form, adminLastName: e.target.value })}
                    />
                    <Input
                      placeholder="Admin email"
                      type="email"
                      value={form.adminEmail}
                      onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    The admin will receive a one-time setup link by email to set
                    their password.
                  </p>
                </div>
                <Button type="submit">Create</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {createdLink && (
          <div className="mb-4 p-3 rounded-md border border-green-200 bg-green-50 text-sm flex items-center justify-between gap-3">
            <span className="break-all">
              Admin setup link:{" "}
              <a
                className="underline text-cornflower-blue-700"
                href={createdLink}
                target="_blank"
                rel="noreferrer"
              >
                {createdLink}
              </a>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1"
              onClick={() => {
                navigator.clipboard.writeText(createdLink);
                toast.success("Link copied");
              }}
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cornflower-blue-50 text-cornflower-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">Total</p>
              <p className="text-2xl font-bold text-slate-900">{companies.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">Active</p>
              <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">Suspended</p>
              <p className="text-2xl font-bold text-slate-900">
                {companies.length - activeCount}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, slug or admin…"
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>All Companies</CardTitle>
          </CardHeader>
          <CardContent>
            {companies.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No companies yet
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Create your first company to get started.
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Name</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Timezone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-slate-700">
                              {c.adminName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {c.adminEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{c.members}</TableCell>
                        <TableCell>{c.timezone}</TableCell>
                        <TableCell>
                          <Badge className={c.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/company/${c.slug}`)}>
                              View
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  disabled={togglingStatus === c._id}
                                >
                                  {c.status === "active" ? "Suspend" : "Activate"}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {c.status === "active"
                                      ? `Suspend ${c.name}?`
                                      : `Activate ${c.name}?`}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {c.status === "active"
                                      ? "Suspended companies cannot be accessed by their members until reactivated."
                                      : "The company and its members will regain access immediately."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    disabled={togglingStatus === c._id}
                                    onClick={() =>
                                      handleStatus(
                                        c._id,
                                        c.status === "active"
                                          ? "suspended"
                                          : "active"
                                      )
                                    }
                                  >
                                    {togglingStatus === c._id
                                      ? "Saving..."
                                      : `Yes, ${c.status === "active" ? "Suspend" : "Activate"}`}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" onClick={() => setCompanyToDelete(c)}>
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete {companyToDelete?.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This permanently removes the company, its users and attendance records.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setCompanyToDelete(null)}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDelete}>Yes, Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredCompanies.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      No companies match your filters
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Try a different search or status.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Companies;
