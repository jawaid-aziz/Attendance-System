import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export const Tasks = () => {

    const [allTasks, setAllTasks] = useState([]);
  
      const fetchAllTasks = async () => {
      try {
        const response = await fetch("http://localhost:5000/tasks/viewAll", {
          method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        
        const data = await response.json();
        console.log(data);
        setAllTasks(data.tasks);
  
      }catch(error){
        console.log(error);
      }
    }
  
    useEffect(() => {
      fetchAllTasks()
    }, []);

  const tasks = [
    {
      _id: "t1",
      title: "Fix Login Bug",
      description: "Resolve issue with incorrect password errors.",
      Project: "Postings",
      status: "in progress",
      priority: "high",
      dueDate: new Date("2025-06-20"),
      project: "Employee Dashboard"
    },
    {
      _id: "t2",
      title: "Create Task UI",
      description: "Design and build the task UI with Shadcn components.",
      status: "not started",
      priority: "medium",
      dueDate: new Date("2025-06-25"),
      project: "Project Management"
    },
    {
      _id: "t3",
      title: "Write Documentation",
      description: "Write detailed docs for onboarding new devs.",
      status: "completed",
      priority: "low",
      dueDate: new Date("2025-06-10"),
      project: "Internal Tools"
    }
  ]

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">My Assigned Tasks</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allTasks.map((task) => (
          <Card key={task._id} className="rounded-xl hover:shadow-lg transition">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <Badge variant="outline" className="capitalize">
                  {task.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.desc}
              </p>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-muted-foreground">
              <p>
                <span className="font-medium text-black">Project:</span> {task.project.name}
              </p>
              <p>
                <span className="font-medium text-black">Status:</span>{" "}
                <span className="capitalize">{task.status}</span>
              </p>
              <p>
                <span className="font-medium text-black">Due:</span>{" "}
                {format(new Date(task.dueDate), "PPP")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
