import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export const ViewProjects = () => {
  const projects = [
    {
      _id: "1",
      name: "Employee Dashboard UI",
      desc: "Redesign the dashboard with modern UI and better UX.",
      status: "in progress",
      progress: 45,
      priority: "high",
      deadline: new Date("2025-07-01")
    },
    {
      _id: "2",
      name: "API Integration",
      desc: "Integrate project module with attendance and auth APIs.",
      status: "not started",
      progress: 0,
      priority: "medium",
      deadline: new Date("2025-07-15")
    },
    {
      _id: "3",
      name: "Onboarding Automation",
      desc: "Auto-assign tasks to new employees after sign-up.",
      status: "completed",
      progress: 100,
      priority: "low",
      deadline: new Date("2025-06-10")
    },
    {
      _id: "4",
      name: "Bug Fixes - Project Module",
      desc: "Fix bugs in project creation and attachment upload.",
      status: "in progress",
      progress: 70,
      priority: "critical",
      deadline: new Date("2025-06-20")
    }
  ]

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">My Assigned Projects</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <Card key={proj._id} className="hover:shadow-xl transition rounded-xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{proj.name}</CardTitle>
                <Badge variant="outline" className="capitalize">{proj.priority}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{proj.desc}</p>
            </CardHeader>

            <CardContent className="text-sm space-y-1 text-muted-foreground">
              <p>
                <span className="font-medium text-black">Status:</span>{" "}
                {proj.status}
              </p>
              <p>
                <span className="font-medium text-black">Progress:</span>{" "}
                {proj.progress}%
              </p>
              {proj.deadline && (
                <p>
                  <span className="font-medium text-black">Deadline:</span>{" "}
                  {format(new Date(proj.deadline), "PPP")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
