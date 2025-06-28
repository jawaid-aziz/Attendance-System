import React, { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"

export const ViewProjects = () => {

  const navigate = useNavigate();

  const [allProjects, setAllProjects] = useState([]);

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

    }catch(error){
      console.log(error);
    }
  }

  useEffect(() => {
    fetchAllProjects()
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">My Assigned Projects</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allProjects.map((proj) => (
          <Card key={proj._id} onClick={() => navigate(`/project/${proj._id}`)} className="hover:shadow-xl transition rounded-xl cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{proj.name}</CardTitle>
                <Badge variant="outline" className="capitalize">{proj.priority}</Badge>
              </div>
              {/* <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{proj.desc}</p> */}
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
