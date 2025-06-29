import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useRole } from "@/Context/RoleProvider";
import toast, { Toaster } from "react-hot-toast";

export const Project = () => {
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState({});

  const { id } = useParams();

  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUser = async (userId) => {
    console.log(userId);
    if (!userId || users[userId]) return; // Skip if already fetched
    try {
      const res = await fetch(`http://localhost:5000/byId/getUser/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setUsers((prev) => ({ ...prev, [userId]: data.user }));
    } catch (error) {
      console.error("Failed to fetch user:", userId, error);
    }
  };

  const fetchAllRelatedUsers = async (proj) => {
    await fetchUser(proj.createdBy);
    for (let uid of proj.assignedTo) {
      await fetchUser(uid);
    }
    for (let c of proj.comments) {
      await fetchUser(c.user);
    }
    console.log("Users: ", users);
  };

  const fetchProject = async () => {
    try {
      const response = await fetch(`http://localhost:5000/projects/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      setProject(data.project);
      console.log("Project: ", data.project);
      fetchAllRelatedUsers(data.project);
    } catch (error) {
      console.error("Failed to fetch project:", error);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  const handleAddComment = async () => {
    if (!commentText.trim()) return toast.error("Comment cannot be empty.");
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/projects/${id}/addComment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text: commentText }),
      });

      const data = await res.json();
      if (data.success) {
        setProject((prev) => ({
          ...prev,
          comments: [...prev.comments, data.comment], // assuming API returns the new comment
        }));
        setCommentText("");
        toast.success("Comment added!");
      } else {
        toast.error("Failed to add comment.");
      }
    } catch (err) {
      console.error("Comment error:", err);
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!project) return <div className="p-6">Loading...</div>;

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{project.name}</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">{project.desc}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <Separator />

            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="capitalize">
                Priority: {project.priority}
              </Badge>
              <Badge variant="outline" className="capitalize">
                Status: {project.status}
              </Badge>
              <Badge variant="outline">Progress: {project.progress}%</Badge>
            </div>

            <Progress value={project.progress} className="h-2 mt-2" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="text-base font-medium">
                  {format(new Date(project.startDate), "PPP")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="text-base font-medium">
                  {format(new Date(project.deadline), "PPP")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created By</p>
                <p className="text-base font-mono">
                  {users[project.createdBy]?.firstName +
                    " " +
                    users[project.createdBy]?.lastName || project.createdBy}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned To</p>
                {project.assignedTo.length > 0 ? (
                  <ul className="list-disc ml-5 text-sm">
                    {project.assignedTo.map((userId, index) => (
                      <li key={index} className="font-mono">
                        {users[userId]?.firstName || userId}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No one assigned yet</p>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* 📎 Attachments */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Attachments</h3>
              {project.attachments.length > 0 ? (
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  {project.attachments.map((file) => (
                    <li key={file._id}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {file.filename}
                      </a>{" "}
                      <span className="text-muted-foreground text-xs">
                        (uploaded on {format(new Date(file.uploadedAt), "PPP")})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No attachments available.
                </p>
              )}
            </div>

            <Separator className="my-4" />

            {/* 💬 Comments */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Comments</h3>
              {project.comments.length > 0 ? (
                <ul className="space-y-3">
                  {project.comments.map((comment) => (
                    <li
                      key={comment._id}
                      className="border p-3 rounded-md bg-muted/40"
                    >
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">Commented by:</span>{" "}
                        {users[comment.user]?.firstName || comment.user}
                      </p>
                      <p className="text-base">{comment.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(comment.date), "PPP p")}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No comments yet.
                </p>
              )}
            </div>
            {/* 💬 Add New Comment */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Add a Comment</h4>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment here..."
                className="mb-2"
              />
              <Button onClick={handleAddComment} disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
