import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { useRole } from "../Context/RoleProvider";
import { useId } from "../Context/IdProvider";
import { getHomePath } from "@/lib/getHomePath";

export const Setup = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setRole } = useRole();
  const { setId } = useId();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSetup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5000/auth/setup/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("id", data.user.id);
      if (data.slug) localStorage.setItem("slug", data.slug);
      setRole(data.user.role);
      setId(data.user.id);
      navigate(getHomePath());
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full px-6 py-4 flex items-center gap-2">
        <Clock className="h-6 w-6 text-cornflower-blue-700" />
        <h1 className="text-xl font-bold text-cornflower-blue-700">onTime</h1>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Set Your Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSetup} className="grid gap-4">
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Setting up..." : "Set Password & Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Setup;
