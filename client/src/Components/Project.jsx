import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

export const Project = () => {
  const [project, setProject] = useState(null);
  const { id } = useParams();

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
    } catch (error) {
      console.error("Failed to fetch project:", error);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  if (!project) return <div className="p-6">Loading...</div>;

  return (
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
              <p className="text-base font-mono">{project.createdBy}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned To</p>
              {project.assignedTo.length > 0 ? (
                <ul className="list-disc ml-5 text-sm">
                  {project.assignedTo.map((userId, index) => (
                    <li key={index} className="font-mono">
                      {userId}
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
                      <span className="font-medium">User ID:</span>{" "}
                      {comment.user}
                    </p>
                    <p className="text-base">{comment.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(comment.date), "PPP p")}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
