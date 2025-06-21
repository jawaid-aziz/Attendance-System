const Project = require("../../models/Project");
const User = require("../../models/User");

exports.createProject = async (req, res) => {
  try {
    const {
      name,
      desc,
      assignedTo,
      deadline,
      priority,
      status,
      attachments,
      progress,
      comments
    } = req.body;

    // Validate required fields
    if (!name || !desc) {
      return res.status(400).json({ message: "Project name and description are required." });
    }

    const fixedComments = (comments || []).map((comment) => ({
      text: comment.text,
      user: req.user.id,
      date: new Date()
    }));


    const newProject = new Project({
      name,
      desc,
      createdBy: req.user.id,
      assignedTo,
      deadline,
      priority,
      status,
      attachments,
      progress,
      comments: fixedComments,
    });


    const savedProject = await newProject.save();

    return res.status(201).json({
      message: "Project created successfully.",
      project: savedProject
    });

  } catch (err) {
    console.error("Error creating project:", err);
    return res.status(500).json({ message: "Server error while creating project." });
  }
};
