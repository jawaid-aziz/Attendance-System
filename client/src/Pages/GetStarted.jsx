import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/Components/ui/select";
import timezoneData from "../Data/Timezones.json";

const STEPS = ["Company", "Admin", "Done"];

export const GetStarted = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");
  const [company, setCompany] = useState({
    companyName: "",
    totalEmployees: "",
    timezone: "Asia/Karachi",
  });
  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const timezones = [
    {
      value: "Asia/Karachi",
      text: "(UTC+05:00) Islamabad, Karachi",
    },
    ...timezoneData.map((tz) => ({ value: tz.utc[0], text: tz.text })),
  ];

  const canContinue =
    step === 0
      ? company.companyName.trim().length > 1
      : admin.firstName.trim().length > 1 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin.email);

  const handleRegister = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: company.companyName,
          totalEmployees: Number(company.totalEmployees) || 0,
          timezone: company.timezone,
          adminFirstName: admin.firstName,
          adminLastName: admin.lastName,
          adminEmail: admin.email,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }
      setCreatedSlug(data.company?.slug || "");
      toast.success(data.message || "Account created!", { duration: 6000 });
      setStep(2);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="bottom-right" reverseOrder={false} />
      <header className="w-full px-6 py-4 flex items-center gap-2">
        <Clock className="h-6 w-6 text-cornflower-blue-700" />
        <h1 className="text-xl font-bold text-cornflower-blue-700">onTime</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              Get Started
            </CardTitle>
            <div className="flex justify-center gap-2 mt-2">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold border ${
                      i <= step
                        ? "bg-cornflower-blue-700 text-white border-cornflower-blue-700"
                        : "bg-gray-100 text-gray-500 border-gray-300"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-xs hidden sm:block ${
                      i <= step ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 0 && (
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={company.companyName}
                    onChange={(e) =>
                      setCompany({ ...company, companyName: e.target.value })
                    }
                    placeholder="e.g. Tech House Pvt Ltd"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="totalEmployees">Total Employees</Label>
                  <Input
                    id="totalEmployees"
                    type="number"
                    min="0"
                    value={company.totalEmployees}
                    onChange={(e) =>
                      setCompany({ ...company, totalEmployees: e.target.value })
                    }
                    placeholder="How many employees do you have?"
                  />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Select
                    value={company.timezone}
                    onValueChange={(v) =>
                      setCompany({ ...company, timezone: v })
                    }
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
                <Button
                  onClick={() => setStep(1)}
                  disabled={!canContinue}
                  className="w-full gap-2"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={admin.firstName}
                      onChange={(e) =>
                        setAdmin({ ...admin, firstName: e.target.value })
                      }
                      placeholder="Admin first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={admin.lastName}
                      onChange={(e) =>
                        setAdmin({ ...admin, lastName: e.target.value })
                      }
                      placeholder="Admin last name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={admin.email}
                    onChange={(e) =>
                      setAdmin({ ...admin, email: e.target.value })
                    }
                    placeholder="admin@company.com"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500">
                  We'll email you a secure one-time link to set your password.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(0)}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={handleRegister}
                    disabled={!canContinue || submitting}
                    className="flex-1 gap-2"
                  >
                    {submitting ? "Creating account..." : "Create Account"}
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold">
                  Your workspace is being set up!
                </h2>
                <p className="text-sm text-gray-600">
                  We've sent a setup link to{" "}
                  <strong>{admin.email}</strong>. Click it to set your password
                  and access your dashboard.
                  {createdSlug && (
                    <>
                      <br />
                      Your workspace link will be{" "}
                      <strong>
                        localhost:5173/{createdSlug}/login
                      </strong>
                      .
                    </>
                  )}
                </p>
                <Button onClick={() => navigate("/login")} className="mt-2">
                  Go to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default GetStarted;
