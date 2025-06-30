import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import toast, { Toaster } from "react-hot-toast";

export const AddTask = () => {
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    assignedTo: [],
    project: "",
    status: "not started",
    priority: "medium",
    dueDate: "",
    completedAt: "",
  });

  const [users, setUsers] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
    const [selectedUser, setSelectedUser] = useState(""); // for select assign
    const [selectedProject, setSelectedProject] = useState("");


  const fetchAllUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      setUsers(data.employees);
      console.log("Users: ", data.employees);
    } catch (error) {
      toast.error("Failed to fetch employee data", { duration: 5000 });
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllProjects = async () => {
    try {
      const response = await fetch("http://localhost:5000/projects/viewAll", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      console.log(data);
      setAllProjects(data.projects);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

const handleSelectChange = (name, value) => {
  if (name === "assignedTo") {
    setSelectedUser(value);
  } else if (name === "project") {
    setSelectedProject(value);
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};


  const handleAssign = () => {
    if (!selectedUser) return;
    if (formData.assignedTo.includes(selectedUser)) {
      toast.error("User already assigned");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      assignedTo: [...prev.assignedTo, selectedUser],
    }));
    setSelectedUser("");
  };

    const removeAssignedUser = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.filter((id) => id !== userId),
    }));
  };

  const handleAssignProject = () => {
  if (!selectedProject) return toast.error("Please select a project");
  setFormData((prev) => ({ ...prev, project: selectedProject }));
  setSelectedProject("");
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    // basic validation
    if (
      !formData.title ||
      !formData.project ||
      formData.assignedTo.length === 0
    ) {
      return toast.error("Title, project & at least one assignee required");
    }
    try {
      console.log("Submitting task:", formData);

      const res = await fetch("http://localhost:5000/tasks/add-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Task created successfully!");
        setFormData({
          title: "",
          desc: "",
          assignedTo: "",
          project: "",
          status: "not started",
          priority: "medium",
          dueDate: "",
          completedAt: "",
        });
      } else {
        alert(data.message || "Error creating task.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="desc">Description</Label>
          <Textarea name="desc" value={formData.desc} onChange={handleChange} />
        </div>

        {/* Assign To */}
        <div>
          <Label>Assign To</Label>
          <div className="flex gap-4 items-end">
            <Select onValueChange={(v) => handleSelectChange("assignedTo", v)} value={selectedUser}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u._id} value={u._id}>
                    {u.firstName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={handleAssign}>
              Assign
            </Button>
          </div>

          {/* Assigned users list */}
          {formData.assignedTo.length > 0 && (
            <ul className="mt-2 space-y-1">
              {formData.assignedTo.map((id) => {
                const user = users.find((u) => u._id === id);
                return (
                  <li key={id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                    <span>{user?.firstName || "Unknown User"}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeAssignedUser(id)}
                    >
                      Remove
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

<div>
  <Label>Project</Label>
  <div className="flex gap-4 items-end">
    <Select
      onValueChange={(v) => handleSelectChange("project", v)}
      value={selectedProject}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select project..." />
      </SelectTrigger>
      <SelectContent>
        {allProjects.map((p) => (
          <SelectItem key={p._id} value={p._id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Button type="button" onClick={handleAssignProject}>
      Assign Project
    </Button>
  </div>

  {formData.project && (
    <div className="mt-2 bg-gray-100 rounded-md p-2">
      Assigned:{" "}
      <strong>
        {
          allProjects.find((p) => p._id === formData.project)?.name ||
          "Selected Project"
        }
      </strong>
    </div>
  )}
</div>


        <div>
          <Label>Status</Label>
          <Select
            onValueChange={(v) => handleSelectChange("status", v)}
            value={formData.status}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not started">Not Started</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Priority</Label>
          <Select
            onValueChange={(v) => handleSelectChange("priority", v)}
            value={formData.priority}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dueDate">Deadline</Label>
          <Input name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
        </div>

        <Button type="submit" className="w-full">
          Create Task
        </Button>
      </form>
    </>
  );
};
