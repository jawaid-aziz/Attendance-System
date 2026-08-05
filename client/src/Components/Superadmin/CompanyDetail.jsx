import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import toast, { Toaster } from "react-hot-toast";

const apiUrl = "http://localhost:5000";
const token = () => localStorage.getItem("token");

const CompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${apiUrl}/superadmin/companies/${id}`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (!res.ok) throw new Error("Failed to fetch company");
        const data = await res.json();
        setCompany(data.company);
        setUsers(data.users || []);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!company) return <div className="p-6">Company not found.</div>;

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{company.name}</h1>
        <div className="grid gap-3 mb-6 text-sm">
          <div><strong>Slug:</strong> {company.slug}</div>
          <div><strong>Timezone:</strong> {company.timezone}</div>
          <div><strong>Declared employees:</strong> {company.totalEmployees}</div>
          <div>
            <strong>Status:</strong>{" "}
            <Badge className={company.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
              {company.status}
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Members ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell>{`${u.firstName} ${u.lastName}`}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{u.salary}</TableCell>
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

export default CompanyDetail;
