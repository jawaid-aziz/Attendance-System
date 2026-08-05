import { useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Clock, Building2, ShieldCheck, ArrowRight } from "lucide-react";
import { isTokenValid } from "@/lib/isTokenValid";
import { getHomePath } from "@/lib/getHomePath";
import { Button } from "@/Components/ui/button";

export const Landing = () => {
  const navigate = useNavigate();

  if (isTokenValid()) {
    return <Navigate to={getHomePath()} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-cornflower-blue-700" />
          <h1 className="text-xl font-bold text-cornflower-blue-700">onTime</h1>
        </div>
        <Button variant="outline" onClick={() => navigate("/login")}>
          Login
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Simple attendance tracking for your{" "}
            <span className="text-cornflower-blue-700">team</span>
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            onTime gives every organization its own dedicated workspace with
            check-in/out, live timezone handling, office scheduling and
            automated attendance records.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Button
              size="lg"
              onClick={() => navigate("/start")}
              className="gap-2"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
            >
              I have an account
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <Building2 className="h-8 w-8 text-cornflower-blue-700 mb-3" />
            <h3 className="font-semibold mb-1">Per-company workspaces</h3>
            <p className="text-sm text-gray-600">
              Every organization gets its own isolated dashboard with its own
              timezone, schedule and employees.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <Clock className="h-8 w-8 text-cornflower-blue-700 mb-3" />
            <h3 className="font-semibold mb-1">Smart check-in/out</h3>
            <p className="text-sm text-gray-600">
              Employees clock in and out from the office network with live
              timezone-aware tracking and automatic absence marking.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <ShieldCheck className="h-8 w-8 text-cornflower-blue-700 mb-3" />
            <h3 className="font-semibold mb-1">Secure onboarding</h3>
            <p className="text-sm text-gray-600">
              Admins are invited via a secure one-time setup link — no passwords
              in email.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
