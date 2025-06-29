import React, { useState } from "react";
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

export const AddTask = () => {
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    assignedTo: "",
    project: "",
    status: "not started",
    priority: "medium",
    dueDate: "",
    completedAt: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 space-y-6">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input name="title" value={formData.title} onChange={handleChange} required />
      </div>

      <div>
        <Label htmlFor="desc">Description</Label>
        <Textarea name="desc" value={formData.desc} onChange={handleChange} />
      </div>

      <div>
        <Label htmlFor="assignedTo">Assigned To (User ID)</Label>
        <Input name="assignedTo" value={formData.assignedTo} onChange={handleChange} required />
      </div>

      <div>
        <Label htmlFor="project">Project (Project ID)</Label>
        <Input name="project" value={formData.project} onChange={handleChange} required />
      </div>

      <div>
        <Label>Status</Label>
        <Select
          onValueChange={(value) => handleSelectChange("status", value)}
          defaultValue={formData.status}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
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
          onValueChange={(value) => handleSelectChange("priority", value)}
          defaultValue={formData.priority}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="dueDate">Due Date</Label>
        <Input name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
      </div>

      <div>
        <Label htmlFor="completedAt">Completed At</Label>
        <Input name="completedAt" type="date" value={formData.completedAt} onChange={handleChange} />
      </div>

      <Button type="submit" className="w-full">
        Create Task
      </Button>
    </form>
  );
};
