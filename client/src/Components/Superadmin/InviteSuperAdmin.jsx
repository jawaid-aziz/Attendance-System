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
import toast, { Toaster } from "react-hot-toast";
import { API_URL } from "@/lib/config";

const apiUrl = API_URL;
const token = () => localStorage.getItem("token");

const InviteSuperAdmin = () => {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [superAdmins, setSuperAdmins] = useState([]);

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
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="container mx-auto p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Invite Super Admin</h1>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleInvite} className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <Button type="submit">Send Invitation</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Super Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {superAdmins.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell>{`${u.firstName} ${u.lastName}`}</TableCell>
                    <TableCell>{u.email}</TableCell>
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

export default InviteSuperAdmin;
