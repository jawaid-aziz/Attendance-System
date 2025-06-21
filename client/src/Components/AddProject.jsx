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
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import toast, { Toaster } from "react-hot-toast";

export const AddProject = () => {
  const [projectData, setProjectData] = useState({
    name: "",
    desc: "",
    priority: "medium",
    status: "not started",
    deadline: null,
    assignedTo: [],
    attachments: [],
    comments: [],
    progress: 0,
  });

  const [dateOpen, setDateOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  // Mocked user list - later fetch from API
  const allUsers = [
    { _id: "1", name: "Javaid" },
    { _id: "2", name: "Ali" },
    { _id: "3", name: "Hina" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setProjectData((prev) => ({ ...prev, deadline: date }));
    setDateOpen(false);
  };

  const addAssignedUser = () => {
    if (selectedUser && !projectData.assignedTo.includes(selectedUser)) {
      setProjectData((prev) => ({
        ...prev,
        assignedTo: [...prev.assignedTo, selectedUser],
      }));
    }
  };

  const removeAssignedUser = (userId) => {
    setProjectData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.filter((id) => id !== userId),
    }));
  };

  const addComment = () => {
    if (commentText.trim()) {
      const newComment = {
        user: "currentUserId123", // replace with actual user ID from auth
        text: commentText,
        date: new Date(),
      };
      setProjectData((prev) => ({
        ...prev,
        comments: [...prev.comments, newComment],
      }));
      setCommentText("");
    }
  };

  const addAttachment = () => {
    if (fileUrl.trim()) {
      const newAttachment = {
        filename: fileUrl.split("/").pop(),
        url: fileUrl,
        uploadedAt: new Date(),
      };
      setProjectData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment],
      }));
      setFileUrl("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:5000/admin/createProject",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Token logic added
          },
          body: JSON.stringify(projectData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create a Project.", {
          duration: 5000,
        });
      }
      toast.success("Project added successfully!", { duration: 5000 });
      console.log("✅ Project created:", response.data);
      setProjectData({
        name: "",
        desc: "",
        priority: "medium",
        status: "not started",
        deadline: null,
        assignedTo: [],
        attachments: [],
        comments: [],
        progress: 0,
      });
    } catch (err) {
      toast.error("Error creating project:", err);
    }
  };

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="max-w-xl mx-auto mt-10 p-6 border rounded-xl shadow-md bg-white space-y-6">
        <h2 className="text-2xl font-semibold">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              name="name"
              value={projectData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea
              name="desc"
              value={projectData.desc}
              onChange={handleChange}
              required
            />
          </div>

          {/* Priority */}
          <div>
            <Label>Priority</Label>
            <Select
              value={projectData.priority}
              onValueChange={(val) => handleSelectChange("priority", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select
              value={projectData.status}
              onValueChange={(val) => handleSelectChange("status", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not started">Not Started</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deadline */}
          <div className="flex flex-col gap-1">
            <Label>Deadline</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {projectData.deadline
                    ? format(projectData.deadline, "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={projectData.deadline || undefined}
                  onSelect={handleDateChange}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Assigned To */}
          <div>
            <Label>Assign Employees</Label>
            <div className="flex gap-2 mb-2">
              <Select onValueChange={(val) => setSelectedUser(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="secondary"
                onClick={addAssignedUser}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {projectData.assignedTo.map((id) => {
                const user = allUsers.find((u) => u._id === id);
                return (
                  <div
                    key={id}
                    className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                  >
                    <span>{user?.name || "Unknown"}</span>
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeAssignedUser(id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <Label>Attachment</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <Input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://example.com/design.png"
              />
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Attachment name (e.g. GitHub, Design Doc)"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (fileUrl && fileName) {
                  const newAttachment = {
                    filename: fileName,
                    url: fileUrl,
                    uploadedAt: new Date(),
                  };
                  setProjectData((prev) => ({
                    ...prev,
                    attachments: [...prev.attachments, newAttachment],
                  }));
                  setFileUrl("");
                  setFileName("");
                }
              }}
            >
              Add Attachment
            </Button>

            {/* Display added attachments */}
            <ul className="list-disc ml-6 mt-2 text-sm text-gray-700 space-y-1">
              {projectData.attachments.map((file, idx) => (
                <li key={idx}>
                  <strong>{file.filename}:</strong>{" "}
                  <a
                    href={file.url}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {file.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Comments */}
          <div>
            <Label>Add Comment</Label>
            <div className="flex gap-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
              />
              <Button type="button" variant="secondary" onClick={addComment}>
                Add
              </Button>
            </div>
            <ul className="list-disc ml-6 mt-1 text-sm text-gray-600">
              {projectData.comments.map((c, idx) => (
                <li key={idx}>{c.text}</li>
              ))}
            </ul>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full mt-4">
            Create Project
          </Button>
        </form>
      </div>
    </>
  );
};
