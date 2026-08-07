import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Checkbox } from "@/Components/ui/checkbox";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Skeleton } from "@/Components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/Components/ui/card";
import { Loader2, Save, Router, Coins, Plus, Trash2 } from "lucide-react";
import { API_URL } from "@/lib/config";

const DEFAULT_CONFIG = {
  lateCheckInRate: 50,
  noCheckOutRate: 50,
  absentRate: 100,
  lateGraceMinutes: 15,
  noCheckOutGraceHours: 2,
};

export const Configuration = () => {
  // States for deduction configuration
  const [deductionsEnabled, setDeductionsEnabled] = useState(false);
  const [deductionConfig, setDeductionConfig] = useState(DEFAULT_CONFIG);
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);

  // States for allowed IP configuration
  const [allowedIPs, setAllowedIPs] = useState([]);
  const [newIP, setNewIP] = useState("");

  // Fetch deduction configuration on component load
  useEffect(() => {
    const fetchDeductionConfiguration = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/getDeductions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setDeductionsEnabled(data.deductionsEnabled);
          setDeductionConfig({
            ...DEFAULT_CONFIG,
            ...(data.deductionConfig || {}),
          });
        } else {
          toast.error("Failed to fetch deduction configuration.", {
            duration: 5000,
          });
        }
      } catch (error) {
        toast.error(
          `Failed to fetch deduction configuration: ${error.message}`,
          { duration: 5000 }
        );
      } finally {
        setConfigLoading(false);
      }
    };

    fetchDeductionConfiguration();
  }, []);

  // Fetch allowed IP configuration on component load
  useEffect(() => {
    const fetchAllowedIPs = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/getAllowedIP`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAllowedIPs(data.allowedIPs);
        } else {
          toast.error("Failed to fetch allowed IPs.", { duration: 5000 });
        }
      } catch (error) {
        toast.error(`Failed to fetch allowed IPs: ${error.message}`, {
          duration: 5000,
        });
      }
    };

    fetchAllowedIPs();
  }, []);

  // Handle deduction toggling
  const handleToggleDeductions = (checked) => {
    setDeductionsEnabled(!!checked);
  };

  // Handle a deduction config field change
  const handleConfigChange = (field) => (e) => {
    const value = parseFloat(e.target.value);
    setDeductionConfig((prev) => ({
      ...prev,
      [field]: Number.isFinite(value) ? value : 0,
    }));
  };

  // Save deduction configuration
  const handleSaveDeductionConfiguration = async () => {
    setConfigSaving(true);
    try {
      const response = await fetch(`${API_URL}/admin/updateDeductions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          deductionsEnabled,
          deductionConfig,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(data.message || "Failed to save deduction configuration.", {
          duration: 5000,
        });
        return;
      }

      toast.success("Deduction configuration saved successfully.", {
        duration: 5000,
      });
    } catch (error) {
      toast.error(
        `Failed to save deduction configuration: ${error.message}`,
        { duration: 5000 }
      );
    } finally {
      setConfigSaving(false);
    }
  };

  // Handle adding a new IP
  const handleAddIP = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/addAllowedIP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ip: newIP }),
      });

      if (response.ok) {
        const data = await response.json();
        setAllowedIPs(data.allowedIPs);
        toast.success("IP added successfully.");
        setNewIP("");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to add IP.");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  // Handle removing an IP
  const handleRemoveIP = async (ip) => {
    try {
      const response = await fetch(`${API_URL}/admin/removeAllowedIP`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ip }),
      });

      if (response.ok) {
        const data = await response.json();
        setAllowedIPs(data.allowedIPs);
        toast.success("IP removed successfully.");
      } else {
        toast.error("Failed to remove IP.");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const rateFields = [
    {
      key: "lateCheckInRate",
      label: "Late Check-In",
      hint: "% of a day of salary, applied when an employee checks in after the grace window.",
    },
    {
      key: "noCheckOutRate",
      label: "No Check-Out",
      hint: "% of a day's salary, applied when an employee never checks out.",
    },
    {
      key: "absentRate",
      label: "Absent",
      hint: "% of a day's salary, applied when an employee never checks in.",
    },
  ];

  const graceFields = [
    {
      key: "lateGraceMinutes",
      label: "Late grace (minutes)",
      hint: "How long after office start a check-in is still considered on time.",
    },
    {
      key: "noCheckOutGraceHours",
      label: "No check-out grace (hours)",
      hint: "How long after office end a check-out can still be logged.",
    },
  ];

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Configuration
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Deduction rules and allowed check-in locations.
          </p>
        </div>

        {/* Deduction Configuration Section */}
        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-cornflower-blue-600" />
              <CardTitle className="text-lg">Deduction Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {configLoading ? (
              <Skeleton className="h-40 rounded-xl bg-slate-100" />
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="deductionsEnabled"
                    checked={deductionsEnabled}
                    onCheckedChange={handleToggleDeductions}
                  />
                  <div>
                    <label
                      htmlFor="deductionsEnabled"
                      className="text-sm font-medium text-slate-900"
                    >
                      Enable deductions
                    </label>
                    <p className="text-xs text-slate-500">
                      Deductions are calculated from each day of salary
                      (monthly salary ÷ 30).
                    </p>
                  </div>
                </div>

                {deductionsEnabled && (
                  <div className="space-y-5 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <div>
                      <p className="mb-3 text-sm font-semibold text-slate-900">
                        Deduction Rates
                      </p>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {rateFields.map((field) => (
                          <div key={field.key} className="space-y-2">
                            <Label htmlFor={field.key}>{field.label} (%)</Label>
                            <Input
                              id={field.key}
                              type="number"
                              min="0"
                              max="100"
                              value={deductionConfig[field.key]}
                              onChange={handleConfigChange(field.key)}
                            />
                            <p className="text-xs text-slate-400">
                              {field.hint}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-semibold text-slate-900">
                        Grace Periods
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {graceFields.map((field) => (
                          <div key={field.key} className="space-y-2">
                            <Label htmlFor={field.key}>{field.label}</Label>
                            <Input
                              id={field.key}
                              type="number"
                              min="0"
                              value={deductionConfig[field.key]}
                              onChange={handleConfigChange(field.key)}
                            />
                            <p className="text-xs text-slate-400">
                              {field.hint}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              onClick={handleSaveDeductionConfiguration}
              disabled={configSaving || configLoading}
            >
              {configSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Deduction Configuration
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Allowed IP Configuration Section */}
        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Router className="h-5 w-5 text-cornflower-blue-600" />
              <CardTitle className="text-lg">Router IP Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex gap-3">
              <Input
                type="text"
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                placeholder="192.168.100.1"
                className="flex-1"
              />
              <Button
                variant="secondary"
                onClick={handleAddIP}
                disabled={!newIP.trim()}
              >
                <Plus className="h-4 w-4" /> Add IP
              </Button>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-900">
                Allowed Router IPs
              </p>
              {allowedIPs.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                  No allowed IPs configured yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {allowedIPs.map((ip, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5"
                    >
                      <span className="font-mono text-sm text-slate-800">
                        {ip}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveIP(ip)}
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
