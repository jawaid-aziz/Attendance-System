const Project = require("../../models/Project")
const User = require("../../models/User")

exports.viewAllProjects = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role

    console.log("Request from:", userRole, "| User ID:", userId)

    let projects

    if (userRole === "admin") {
      // Admin gets all projects
      projects = await Project.find()
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
    } else {
      // Regular user gets only assigned projects
      projects = await Project.find({ assignedTo: userId })
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    })
  } catch (err) {
    console.error("❌ Error fetching projects:", err)
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching projects"
    })
  }
}
