import { useEffect, useState } from "react";
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
import { Copy } from "lucide-react";
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

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [createdLink, setCreatedLink] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    totalEmployees: "",
    timezone: "Asia/Karachi",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
  });
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
      setForm({
        name: "", slug: "", totalEmployees: "", timezone: "Asia/Karachi",
        adminFirstName: "", adminLastName: "", adminEmail: "",
      });
      setCreateOpen(false);
      fetchCompanies();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <div className="p-6">Loading companies...</div>;

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Companies</h1>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>Create Company</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Company</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="grid gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Slug (optional)</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated from name"
                  />
                </div>
                <div>
                  <Label>Total Employees</Label>
                  <Input
                    type="number"
                    value={form.totalEmployees}
                    onChange={(e) => setForm({ ...form, totalEmployees: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Select
                    value={form.timezone}
                    onValueChange={(v) => setForm({ ...form, timezone: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Timezone" />
                    </SelectTrigger>
                    <SelectContent className="h-60">
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

        <Card>
          <CardHeader>
            <CardTitle>All Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.slug}</TableCell>
                    <TableCell>{c.members}</TableCell>
                    <TableCell>{c.timezone}</TableCell>
                    <TableCell>
                      <Badge className={c.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/company/${c.slug}`)}>
                          View
                        </Button>
                        {c.status === "active" ? (
                          <Button variant="secondary" size="sm" onClick={() => handleStatus(c._id, "suspended")}>
                            Suspend
                          </Button>
                        ) : (
                          <Button variant="secondary" size="sm" onClick={() => handleStatus(c._id, "active")}>
                            Activate
                          </Button>
                        )}
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
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Companies;
