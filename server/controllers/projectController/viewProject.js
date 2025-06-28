const Project = require("../../models/Project")
const User = require("../../models/User")

exports.viewProject = async (req, res) => {
    const userId = req.user.id
    const userRole = req.user.role
    const projectId = req.params.id;
    console.log(projectId);

    try{
        const project = await Project.findById(projectId);
        res.status(200).json({
        success: true,
        project
    })
    }catch(error){
    console.error("❌ Error fetching project data:", error)
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching project data"
    })
    }

}