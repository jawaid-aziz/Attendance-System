import { useEffect, useState } from "react";
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
import { Skeleton } from "@/Components/ui/skeleton";
import {
  Building2,
  Globe,
  Users,
  Hash,
  ShieldCheck,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { API_URL } from "@/lib/config";

const apiUrl = API_URL;
const token = () => localStorage.getItem("token");

const CompanyDetail = () => {
  const { slug } = useParams();
  const [company, setCompany] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${apiUrl}/superadmin/companies/${slug}`, {
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
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
        <Skeleton className="h-20 w-64 bg-slate-100" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-slate-100" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl bg-slate-100" />
      </div>
    );
  }
  if (!company) return <div className="p-6">Company not found.</div>;

  const metaCards = [
    { label: "Slug", value: company.slug, icon: <Hash className="h-5 w-5" />, tone: "bg-cornflower-blue-50 text-cornflower-blue-600" },
    { label: "Timezone", value: company.timezone, icon: <Globe className="h-5 w-5" />, tone: "bg-slate-100 text-slate-600" },
    { label: "Declared employees", value: company.totalEmployees, icon: <Users className="h-5 w-5" />, tone: "bg-amber-50 text-amber-600" },
    { label: "Status", value: company.status, icon: <ShieldCheck className="h-5 w-5" />, tone: company.status === "active" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600" },
  ];

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cornflower-blue-50 text-cornflower-blue-600">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
              {company.name}
            </h1>
            <p className="text-sm text-slate-500">
              {company.slug} · {company.timezone}
            </p>
          </div>
          <div className="ml-auto">
            <Badge
              className={
                company.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }
            >
              {company.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metaCards.map((card) => (
            <div
              key={card.label}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
              >
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="truncate text-lg font-bold text-slate-900">
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Members ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No members yet
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Invite team members to get started.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {`${u.firstName} ${u.lastName}`}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            u.role === "admin"
                              ? "bg-cornflower-blue-50 text-cornflower-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
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

export default CompanyDetail;
