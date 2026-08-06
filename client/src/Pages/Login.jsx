import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRole } from "../Context/RoleProvider";
import { useId } from "../Context/IdProvider";
import { getHomePath } from "@/lib/getHomePath";
import { API_URL } from "@/lib/config";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/Components/ui/card";
import { Alert, AlertDescription } from "@/Components/ui/alert";

const Login = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setError] = useState(null);
  const { setId } = useId();
  const { setRole } = useRole();
  const { slug } = useParams();

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, slug: slug || undefined }),
      });

      // const data = await response.json();

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Something went wrong.");
        return;
      }

      // Parse response JSON
      const data = await response.json();
      const { token, user } = data;

      // Store token, role, and id in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("id", user.id);
      localStorage.setItem("slug", data.slug || "");

      // Update context
      setRole(user.role);
      setId(user.id);
      window.dispatchEvent(new Event("auth-changed"));
      navigate(getHomePath());
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Top-left Heading */}
      <div className="absolute top-6 left-6">
        <h1 className="text-2xl font-bold text-cornflower-blue-700">onTime</h1>
      </div>

      {/* Centered Login Card */}
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center text-xl">Login</CardTitle>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <div className="mt-4 text-center text-sm text-gray-600">
                <span>
                  New company?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/start")}
                    className="text-blue-600 underline"
                  >
                    Get Started
                  </button>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
